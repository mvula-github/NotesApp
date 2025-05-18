require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING);
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Helper: Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Middleware: Role-based authorization
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).json({ error: true, message: "No token" });
    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({
            error: true,
            message: "Forbidden: insufficient permissions",
          });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ error: true, message: "Invalid token" });
    }
  };
}

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body || {};

    if (!fullName) {
      return res
        .status(400)
        .json({ error: true, message: "Full name is required" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ error: true, message: "Email is required" });
    }
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid email format" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ error: true, message: "Password is required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          error: true,
          message: "Password must be at least 6 characters",
        });
    }

    const isUser = await User.findOne({ email: email });
    if (isUser) {
      return res
        .status(409)
        .json({ error: true, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Only allow "admin" if explicitly set, otherwise default to "user"
    const userRole = role === "admin" ? "admin" : "user";
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role: userRole,
    });
    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );
    return res.status(201).json({
      error: false,
      user: {
        fullName: user.fullName,
        email: user.email,
        _id: user._id,
        role: user.role,
      },
      accessToken,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Error in /register:", err.message);
    res.status(500).json({ error: true, message: "Something went wrong" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email) {
      return res
        .status(400)
        .json({ error: true, message: "Email is required" });
    }
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid email format" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ error: true, message: "Password is required" });
    }

    const userInfo = await User.findOne({ email: email });
    if (!userInfo) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid Credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, userInfo.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign(
      { userId: userInfo._id, role: userInfo.role },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    return res.json({
      error: false,
      user: {
        fullName: userInfo.fullName,
        email: userInfo.email,
        _id: userInfo._id,
        role: userInfo.role,
      },
      accessToken,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Error in /login:", err.message);
    res.status(500).json({ error: true, message: "Something went wrong" });
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

    const user = await User.findById(decoded.userId).select(
      "fullName email role"
    );
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    res.json({ error: false, user });
  } catch (err) {
    console.error("Error in /me:", err.message);
    res.status(500).json({ error: true, message: "Something went wrong" });
  }
});

// Example admin-only route
app.get("/admin", authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome, admin! You have access to this protected route.",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Auth microservice running on port", process.env.PORT);
});
