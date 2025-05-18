require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/user.model");

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Register endpoint
app.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body || {};

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({ error: true, message: "User already exists" });
  }

  const user = new User({ fullName, email, password });
  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: process.env.TOKEN_EXPIRY,
  });
  return res.json({
    error: false,
    user,
    accessToken,
    message: "User created successfully",
  });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const userInfo = await User.findOne({ email: email });

  if (userInfo.email === email && userInfo.password === password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: process.env.TOKEN_EXPIRY,
    });

    return res.json({
      error: false,
      email,
      accessToken,
      message: "Login successful",
    });
  } else {
    return res.json({
      error: true,
      message: "Invalid Credentials",
    });
  }
});

// Get user info (protected)
app.get("/me", async (req, res) => {
  const { user } = req.user; // <-- FIXED

  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.status(401).json({ error: true, message: "User not found" });
  }

  return res.status(200).json({
    error: false,
    user: { fullName: isUser.fullName, email: isUser.email },
  });
});

app.listen(process.env.PORT, () => {
  console.log("Auth microservice running");
});
