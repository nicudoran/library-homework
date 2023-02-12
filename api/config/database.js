const mongoose = require("mongoose");
require("dotenv").config();

const { MONGO_URL } = process.env.MONGO_URL;
const mongo_url = MONGO_URL || "mongodb://localhost:27017/tutorial";

exports.connect = () => {
  mongoose
    .connect(mongo_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to MongoDB");
    })
    .catch((err) => {
      console.log("Database connection failed");
      console.log(err);
      process.exit(1);
    });
};
