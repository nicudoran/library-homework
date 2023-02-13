require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { isAuthenticated, hasRole } = require("./middleware/auth");
var mongoose = require("mongoose");

require("./config/database").connect(); //conectare la baza de date mongodb

//import modele documente db
const User = require("./model/user");
const Book = require("./model/book");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// import variabile din .env

const TOKEN_KEY = process.env.TOKEN_KEY;
const admins = process.env.admins;

// aici construim endpoint-urile
app.post("/register", async (req, res) => {
  //incercam sa aducem date din frontend - in caz de esec trimitem raspuns corespunzator
  try {
    const { email, username, password } = req.body;
    if (!(email && username && password)) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // verificam daca cel care incearca sa se inregistreze este deja intrgistrat - daca da, returnam raspuns in consecinta
    const oldUser = await User.findOne({ username });

    if (oldUser) {
      return res
        .status(409)
        .json({ message: "Username already exists. Please login" });
    }

    const oldEmail = await User.findOne({ email });
    if (oldEmail) {
      return res
        .status(409)
        .json({ message: "Username already exists. Please login" });
    }

    // identificam rolul celui care se inregistreaza, cautand daca acesta este declarat in lista de admini descrisa in .env
    // am folosit operatorul ternar - preferatul meu :)
    const role = admins.includes(email) ? "admin" : "user";

    //criptam parola transmisa te userul care se inregistreaza, folosind bcryptjs .hash, cu sal=10
    const hashedPassword = await bcrypt.hash(password, 10);

    // pana la urma am ajuns sa inregistram userul in baza de date mongodb

    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      email: email.toLowerCase(),
      role: role,
    });

    // construim token-ul pentru user, folosind id, username si rolul acestuia - stabilind si un termen in care sa expire
    const token = jwt.sign(
      { user_id: newUser._id, username, role },
      TOKEN_KEY,
      { expiresIn: "3h" }
    );
    // atribuim token-ul semnat user-ului inregistrat si returnam un raspuns de succes - cod 201 -created
    newUser.token = token;
    return res.status(201).json(newUser);
  } catch (err) {
    //   prindem erorile ce pot sa apara in la citirea datelor transmise din frontend - ca best practice le si logam pentru a incerca un debug ulterior
    console.log("Error on register: ", err);
  }
});

app.post("/login", async (req, res) => {
  //incercam sa aducem datele din frontend - intodeauna folosim un block try-catch pentru a gestiona eventuale erori
  try {
    const { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User not found - Please register!" });
    }

    if (
      existingUser &&
      (await bcrypt.compare(password, existingUser.password))
    ) {
      const token = jwt.sign(
        {
          user_id: existingUser._id,
          username,
          role: existingUser.role,
          borrowedBooks: existingUser.borrowedBooks,
        },
        TOKEN_KEY,
        { expiresIn: "3h" }
      );
      existingUser.token = token;
      return res.status(200).json(existingUser);
    }
    return res.status(400).send({ message: "Invalid credentials" });
  } catch (err) {
    console.log("Error on login: ", err);
  }
});

//Endpoint pentru a adauga carti in biblioteca...disponibil doar pentru admini
app.post("/add-book", isAuthenticated, hasRole("admin"), async (req, res) => {
  try {
    const { title, author, description } = req.body;
    if (!(title && author)) {
      return res.status(400).send({ message: "Title and author are required" });
    }

    const existingBook = await Book.findOne({ title, author });
    if (existingBook) {
      return res
        .status(409)
        .json({ message: "The book already exists in the database!" });
    }
    const newBook = await Book.create({
      title,
      author,
      userId: req.user.user_id,
      description: description,
    });
    return res.status(200).json(newBook);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error on request" });
  }
});

//endpoint pentru a returna toate cartile din biblioteca
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find({});
    return res.status(200).json(books);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error on request" });
  }
});
app.get("/users/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error on request" });
  }
});

//endpoint pentru a returna o carte, in baza id-ului unic
app.get("/book/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).send({ message: "Book not found" });
    }
    return res.status(200).json(existingBook);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error on request" });
  }
});

//endpoint pentru a imprumuta o carte plus adaugare id carte in lista de carti imprumutate de user
app.post("/transaction", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const existingBook = await Book.findOne({ _id: id });

    if (!existingBook) {
      return res
        .status(400)
        .json({ message: "The book does not exist in our libray!" });
    }
    if (!(existingBook.status === "available")) {
      return res.status(400).json({ message: "The book is not available!" });
    }
    userId = req.user.user_id;

    existingBook.status = "borrowed";
    existingBook.borrowed_by = userId;

    const updatedBook = await existingBook.save();

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { borrowedBooks: id } },
      { upsert: true }
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return res.status(200).json(updatedBook);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error on request" });
  }
});

//endpoint pentru return -plus eliminare id carte din lista de carti imprumutate de user
app.post("/return", isAuthenticated, async (req, res) => {
  try {
    const { book_id } = req.body;
    if (!book_id) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const existingBook = await Book.findOne({ _id: book_id });

    if (!existingBook) {
      return res
        .status(400)
        .json({ message: "The book does not exist in our libray!" });
    }
    if (existingBook.status === "available") {
      return res
        .status(400)
        .json({ message: "The book is already available!" });
    }
    existingBook.status = "available";
    existingBook.borrowed_by = "";
    //verificam daca cartea pentru care se face cerere de retur este imprumutata de catre userul autentificat - daca da, se scoate din lista userului,si devine available
    userId = req.user.user_id;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.borrowedBooks.includes(book_id)) {
      const updatedBook = await existingBook.save();
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { borrowedBooks: book_id } },
        { new: true }
      );
      if (!updatedUser) {
        throw new Error("User not found");
      }
      return res.status(200).json(updatedBook);
    }
    return res.status(409).send({ message: "You did not borrowed this book!" });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error on request" });
  }
});

app.delete(
  "/books/:id",
  isAuthenticated,
  hasRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const existingBook = await Book.findById(id);
      if (!existingBook) {
        return res.status(404).send({ message: "Book not found" });
      } else {
        await existingBook.deleteOne();
        return res.status(200).send({ message: "Book deleted" });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send({ message: "Error on request" });
    }
  }
);

app.post("/review", isAuthenticated, async (req, res) => {
  try {
    const { book_id, rating, review_author, review } = req.body;
    if (!(book_id && rating && review_author)) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const existingBook = await Book.findOne({ _id: book_id });

    if (!existingBook) {
      return res
        .status(400)
        .json({ message: "The book does not exist in our libray!" });
    }

    const newReview = {
      rating: rating,
      review: review,
      username: review_author,
      userId: req.user.user_id,
    };

    const updatedBook = await Book.findOneAndUpdate(
      { _id: book_id },
      { $push: { reviews: newReview } },
      { upsert: true }
    );
    return res.status(200).json(updatedBook);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error on request" });
  }
});

app.get("/average/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const ratings = await Book.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      },
      {
        $group: {
          _id: id,
          avg: {
            $avg: {
              $avg: "$reviews.rating",
            },
          },
        },
      },
    ]);
    if (!ratings) {
      return res.status(400).send("Book has no rating");
    }
    return res.status(200).send(ratings[0]);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error on request" });
  }
});

module.exports = app;
