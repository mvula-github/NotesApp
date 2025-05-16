require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const config = require("./config.json");
const mongoose = require("mongoose");
const { authenticateToken } = require("./utils");

//mongoDB connection
mongoose.connect(process.env.CONNECTION_STRING);

//models
const User = require("./models/user.model");
const Note = require("./models/note.model");

const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

//Create Account
app.post("/create-account", async (req, res) => {
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
//login
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

  if (userInfo.email == email && userInfo.password == password) {
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

//add note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body || {};
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({ error: false, message: "Note added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
});

app.listen(8000);
module.exports = app;
