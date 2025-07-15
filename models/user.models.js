const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, 
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
  isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
