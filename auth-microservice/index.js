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

  // Only sign userId in the token for consistency with /me
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );
  return res.json({
    error: false,
    user: { fullName: user.fullName, email: user.email, _id: user._id },
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

  if (userInfo && userInfo.password === password) {
    const accessToken = jwt.sign(
      { userId: userInfo._id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

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
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).json({ error: true, message: "No token" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    const user = await User.findById(decoded.userId).select("fullName email");
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    res.json({ error: false, user });
  } catch (err) {
    console.error("Error in /me:", err.message);
    res.status(500).json({ error: true, message: "Something went wrong" });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Auth microservice running");
});
