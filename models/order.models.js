const mongoose = require("mongoose")
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  totalAmount: Number,
  shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  paymentMethod: { type: String, default: "UPI" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
