const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a username is valid (no duplicates)
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Authenticate user by username and password
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN (object key)
  const { review } = req.query; // Get the review text
  const username = req.session?.authorization?.username; // Get the username from session

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  // Access the book using the object key (ISBN)
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Initialize reviews if not present
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update the user's review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added or updated.",
    reviews: book.reviews,
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN (object key)
  const username = req.session?.authorization?.username; // Get the username from session

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please log in to delete a review." });
  }

  // Access the book using the object key (ISBN)
  const book = books[isbn];

  if (!book) {
    return res
      .status(404)
      .json({ message: "Book not found with the given ISBN." });
  }

  // Check if the user's review exists
  if (!book.reviews || !book.reviews[username]) {
    return res
      .status(404)
      .json({ message: "Review not found for the given user." });
  }

  // Delete the user's review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully.",
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
