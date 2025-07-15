const mongoose = require("mongoose")
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart
