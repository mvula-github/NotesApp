require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const config = require("./config.json");
const mongoose = require("mongoose");
const { authenticateToken } = require("./utils");
const axios = require("axios");
const { body, validationResult, param } = require("express-validator");
const rateLimit = require("express-rate-limit");

//mongoDB connection
mongoose.connect(process.env.CONNECTION_STRING);

//models
const User = require("./models/user.model");
const Note = require("./models/note.model");

const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: true,
    message: "Too many requests, please try again later.",
  },
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

//Backend is up and running

//---------------------------------USER-------------------------
//Create Account
app.post(
  "/create-account",
  [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .escape(),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: errors.array()[0].msg });
    }
    next();
  },
  async (req, res) => {
    try {
      const response = await axios.post(
        `http://localhost:${process.env.AUTH_PORT}/register`,
        req.body
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: true, message: "Auth service error" });
    }
  }
);

//login
app.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: errors.array()[0].msg });
    }
    next();
  },
  async (req, res) => {
    try {
      const response = await axios.post(
        `http://localhost:${process.env.AUTH_PORT}/login`,
        req.body
      );
      res.json(response.data);
    } catch (err) {
      console.error(
        "Auth microservice error:",
        err.response ? err.response.data : err.message
      );
      res.status(500).json({ error: true, message: "Auth service error" });
    }
  }
);

app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    // Forward the JWT token to the microservice
    const response = await axios.get(
      `http://localhost:${process.env.AUTH_PORT}/me`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: true, message: "Auth service error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    console.log("Authorization header:", req.headers.authorization); // Add this line
    const response = await axios.get(
      `http://localhost:${process.env.AUTH_PORT}/users`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(
      "Auth microservice /users error:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: true, message: "Auth service error" });
  }
});

//---------------------------------NOTES-------------------------
//add note
app.post(
  "/add-note",
  authenticateToken,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 100 })
      .withMessage("Title too long")
      .escape(),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ max: 1000 })
      .withMessage("Content too long")
      .escape(),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: errors.array()[0].msg });
    }
    next();
  },
  async (req, res) => {
    const { title, content, tags } = req.body || {};
    const { user } = req.user;

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
  }
);

//edit note
app.put(
  "/edit-note/:noteId",
  authenticateToken,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Title too long")
      .escape(),
    body("content")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Content too long")
      .escape(),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isPinned")
      .optional()
      .isBoolean()
      .withMessage("isPinned must be a boolean"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: errors.array()[0].msg });
    }
    next();
  },
  async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body || {};
    const { user } = req.user;

    if (!title && !content && !tags) {
      return res.status(400).json({ error: true, message: "No changes found" });
    }

    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      if (title) note.title = title;
      if (content) note.content = content;
      if (tags) note.tags = tags;
      if (isPinned !== undefined) note.isPinned = isPinned;

      await note.save();

      return res.json({ error: false, message: "Note updated successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: true, message: "Something went wrong" });
    }
  }
);

//get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { user } = req.user || {};
  try {
    const notes = await Note.find({ userId: user._id }).sort({ createdAt: -1 });
    return res.json({
      error: false,
      notes,
      message: "Notes retrieved successfully",
    });
  } catch (error) {
    console.error("Error in /get-all-notes:", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
});

//delete note
app.delete(
  "/delete-note/:noteId",
  authenticateToken,
  [param("noteId").isMongoId().withMessage("Invalid note ID")],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: errors.array()[0].msg });
    }
    next();
  },
  async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      await Note.deleteOne({ _id: noteId });

      return res.json({ error: false, message: "Note deleted successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: true, message: "Something went wrong" });
    }
  }
);

//Update isPinned Value
app.put("/update-isPinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body || {};
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (isPinned) note.isPinned = isPinned || false;

    await note.save();

    return res.json({ error: false, message: "Note updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
});

app.listen(process.env.PORT);
module.exports = app;
