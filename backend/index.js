require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const config = require("./config.json");
const mongoose = require("mongoose");
const { authenticateToken } = require("./utils");
const axios = require("axios");

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

//Backend is up and running

//---------------------------------USER-------------------------
//Create Account
app.post("/create-account", async (req, res) => {
  try {
    const response = await axios.post(
      `http://localhost:${process.env.AUTH_PORT}/register`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: true, message: "Auth service error" });
  }
});

//login
app.post("/login", async (req, res) => {
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
});

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

//---------------------------------NOTES-------------------------
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

//edit note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
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
});

//get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    return res.json({
      error: false,
      notes,
      message: "Notes retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
});

//delete note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
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
});

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
