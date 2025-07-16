const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./db/db.connect");

const Product = require("./models/product.models");
const Category = require("./models/category.models");
const Address = require("./models/address.models");
const Cart = require("./models/cart.models");
const Order = require("./models/order.models");
const Wishlist = require("./models/wishlist.models");
const User = require("./models/user.models");


const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true,
}));


initializeDatabase()
  .then(() => console.log("Database connected successfully"))
  .catch(err => {
    console.error("Database connection failed", err);
    process.exit(1);
  });


app.get("/", (req, res) => {
  res.send("E-Commerce API Running");
});


// Product Routes


app.post("/api/products", async (req, res) => {
  try {
    const {
      title, description, price, image, artist,
      dimensions, material, category, stock, tags
    } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: "Missing required fields (title, price, category)" });
    }

    const newProduct = new Product({
      title, description, price, image, artist,
      dimensions, material, category, stock, tags
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: savedProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { category } = req.query; // Get ?category=... from the URL

    const filter = category ? { category } : {}; // If category param exists, filter by it

    const products = await Product.find(filter).populate("category");

    res.json({ data: { products } });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});


app.get("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ data: { product } });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});


// Category Routes


app.post("/api/categories", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const newCategory = new Category({
      name,
      description: description || "",
    });

    const savedCategory = await newCategory.save();
    res.status(201).json({ message: "Category created", category: savedCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category", error: error.message });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ data: { category } });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category" });
  }
});


// Address Routes


app.post("/api/addresses", async (req, res) => {
  try {
    const addresses = req.body.addresses;

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ message: "No address data provided" });
    }

    const saved = await Address.insertMany(addresses);
    res.status(201).json({ message: "Addresses saved", addresses: saved });
  } catch (error) {
    console.error("Error inserting addresses:", error);
    res.status(500).json({ message: "Failed to save addresses", error: error.message });
  }
});


//  User Routes


app.post("/api/users", async (req, res) => {
  try {
    const users = req.body;

    if (users.length === 0) {
      return res.status(400).json({ message: "No user data provided" });
    }

    const savedUsers = await User.insertMany(users);
    res.status(201).json({ message: "Users created", users: savedUsers });
  } catch (error) {
    console.error("Error creating users:", error);
    res.status(500).json({ message: "Failed to create users", error: error.message });
  }
});

app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("wishlist")
      
      .populate("addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User fetched", data: { user } });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});



//  Wishlist Routes


//  Add to wishlist
app.post("/api/wishlist", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (wishlist) {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
      return res.status(200).json({ message: "Product added to wishlist", wishlist });
    } else {
      const newWishlist = new Wishlist({ user: userId, products: [productId] });
      const saved = await newWishlist.save();
      return res.status(201).json({ message: "Wishlist created", wishlist: saved });
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res.status(500).json({ message: "Failed to update wishlist", error: error.message });
  }
});

//  Get wishlist for a user
app.get("/api/wishlist/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ user: userId }).populate("products");

    if (!wishlist) {
      return res.status(200).json({ message: "Empty wishlist", data: { products: [] } });
    }

    return res.status(200).json({ message: "Wishlist fetched", data: wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
});

//  Remove product from wishlist
app.post("/api/wishlist/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );

    await wishlist.save();

    return res.status(200).json({ message: "Product removed from wishlist", wishlist });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({ message: "Failed to remove from wishlist", error: error.message });
  }
});



//  Cart Routes


app.get("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.status(200).json({ message: "Empty cart", data: { items: [] } });
    }

    return res.status(200).json({ message: "Cart fetched", data: cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
});


app.post("/api/cart/update", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    return res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Failed to update cart", error: error.message });
  }
});


app.post("/api/cart/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();

    return res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Failed to remove from cart", error: error.message });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`)
})
