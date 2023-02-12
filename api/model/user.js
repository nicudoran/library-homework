const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  role: { type: String },
  borrowedBooks: { type: Array, default: [] },
});

module.exports = mongoose.model("User", userSchema);
