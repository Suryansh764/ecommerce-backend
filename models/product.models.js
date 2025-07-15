const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  artist: String,
  dimensions: String,
  material: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  stock: Number,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
