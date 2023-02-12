const mongoose = require("mongoose");
const Review = {
  rating: Number,
  review: String,
  username: String,
  userId: mongoose.Schema.Types.ObjectId,
};

const bookSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  author: { type: String, required: true },
  description: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", requierd: true },
  status: { type: String, default: "available" },
  reviews: [{ type: Review, default: [] }],
  borrowed_by: { type: String },
});

module.exports = mongoose.model("Book", bookSchema);
