const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop (Task 10)
public_users.get("/", async (req, res) => {
  try {
    // Simulate an API call using Axios
    const response = await new Promise((resolve) => {
      setTimeout(() => resolve({ data: books }), 1000);
    });

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve books" });
  }
});

// Get book details based on ISBN (Task 11)
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    // Simulate an API call using Axios
    const response = await new Promise((resolve) => {
      const book = books[isbn];
      setTimeout(() => resolve({ data: book }), 1000);
    });

    if (response.data) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Book not found with the given ISBN" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve book by ISBN" });
  }
});

// Get book details based on author (Task 12)
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();

  try {
    // Simulate an API call using Axios
    const response = await new Promise((resolve) => {
      const booksByAuthor = Object.values(books).filter(
        (book) => book.author.toLowerCase() === author
      );
      setTimeout(() => resolve({ data: booksByAuthor }), 1000);
    });

    if (response.data.length > 0) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "No books found by the given author" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve books by author" });
  }
});

// Get all books based on title (Task 13)
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title.toLowerCase();

  try {
    // Simulate an API call using Axios
    const response = await new Promise((resolve) => {
      const booksByTitle = Object.values(books).filter((book) =>
        book.title.toLowerCase().includes(title)
      );
      setTimeout(() => resolve({ data: booksByTitle }), 1000);
    });

    if (response.data.length > 0) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "No books found with the given title" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve books by title" });
  }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  // Access the book using the object key (ISBN)
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res
      .status(404)
      .json({ message: "No reviews found for the given ISBN" });
  }
});

module.exports.general = public_users;
