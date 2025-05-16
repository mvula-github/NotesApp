# NotesApp Backend Documentation

## Overview

This backend is a RESTful API for a note-taking application. It is built with **Node.js**, **Express**, and **MongoDB** (using Mongoose). The API supports user authentication (JWT), note CRUD operations, and CORS for frontend integration.

---

## Table of Contents

- [Setup & Configuration](#setup--configuration)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Notes](#notes)
- [Authentication Middleware](#authentication-middleware)
- [Models](#models)
- [Error Handling](#error-handling)
- [Common Issues & Debugging](#common-issues--debugging)

---

## Setup & Configuration

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**  
   See [.env](./.env) for required variables.

3. **Start the server:**
   ```bash
   node index.js
   ```
   The server listens on the port specified in `.env` (`PORT`).

---

## Environment Variables

The backend uses a `.env` file for sensitive configuration:

| Variable            | Description                             |
| ------------------- | --------------------------------------- |
| `ACCESS_TOKEN_KEY`  | Secret key for JWT signing              |
| `TOKEN_EXPIRY`      | JWT token expiry (e.g., `1d` for 1 day) |
| `CONNECTION_STRING` | MongoDB connection URI                  |
| `PORT`              | Port for the Express server             |

**Example:**

```
ACCESS_TOKEN_KEY=your_secret_key
TOKEN_EXPIRY=1d
CONNECTION_STRING=mongodb+srv://user:pass@host/db
PORT=6125
```

---

## API Endpoints

### Authentication

#### `POST /create-account`

- **Description:** Register a new user.
- **Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - `user` object
  - `accessToken` (JWT)

#### `POST /login`

- **Description:** Authenticate a user.
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - `accessToken` (JWT)

---

### Notes

> All note routes require authentication via Bearer token in the `Authorization` header.

#### `POST /add-note`

- **Description:** Create a new note.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Note Title",
    "content": "Note content...",
    "tags": ["tag1", "tag2"]
  }
  ```
- **Response:**
  - Success message

#### `PUT /edit-note/:noteId`

- **Description:** Edit an existing note.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content",
    "tags": ["tag1", "tag2"],
    "isPinned": true
  }
  ```
- **Response:**
  - Success message

#### `GET /get-all-notes`

- **Description:** Retrieve all notes for the authenticated user.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Response:**
  - Array of notes

#### `DELETE /delete-note/:noteId`

- **Description:** Delete a note by ID.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Response:**
  - Success message

---

## Authentication Middleware

- **File:** `utils.js`
- **Function:** `authenticateToken`
- **Purpose:**
  - Extracts JWT from `Authorization` header.
  - Verifies token using `ACCESS_TOKEN_KEY`.
  - Attaches decoded user info to `req.user`.
  - Returns `401` if no token, `403` if invalid/expired.

---

## Models

- **User Model:**  
  Fields: `fullName`, `email`, `password`, `createdOn`, etc.

- **Note Model:**  
  Fields: `title`, `content`, `tags`, `userId`, `isPinned`, `createdAt`, etc.

---

## Error Handling

- Returns appropriate HTTP status codes and JSON error messages.
- Handles missing fields, invalid credentials, not found, and server errors.

---

## Common Issues & Debugging

- **401 Unauthorized:**

  - Missing or invalid JWT token.
  - Ensure `Authorization: Bearer <token>` is set.

- **403 Forbidden:**

  - Token is expired or invalid.
  - Check token validity and expiry.

- **404 Not Found:**

  - Note does not exist or does not belong to user.

- **500 Internal Server Error:**

  - Database or server error.

- **Port Issues:**
  - Ensure you are sending requests to the correct port as set in `.env`.

---

## Example Usage (with curl)

```bash
# Register
curl -X POST http://localhost:6125/create-account -H "Content-Type: application/json" -d '{"fullName":"John","email":"john@example.com","password":"pass"}'

# Login
curl -X POST http://localhost:6125/login -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"pass"}'

# Add Note
curl -X POST http://localhost:6125/add-note -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"title":"Test","content":"Hello"}'

# Get Notes
curl -X GET http://localhost:6125/get-all-notes -H "Authorization: Bearer <token>"
```

---

## License

MIT
