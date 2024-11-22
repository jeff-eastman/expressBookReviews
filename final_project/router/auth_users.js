const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
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

regd_users.put("/auth/review/:isbn", (req, res) => {
  console.log("Route accessed with ISBN:", req.params.isbn);

  const isbn = req.params.isbn;
  const { review } = req.query;
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  const book = Object.values(books).find((book) => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added or updated.",
    reviews: book.reviews,
  });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN from the URL
  const sessionData = req.session.authorization; // Retrieve session data
  const username = sessionData ? sessionData.username : null; // Get the username from the session

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in to delete a review." });
  }

  // Find the book by ISBN
  const book = Object.values(books).find((book) => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found with the given ISBN." });
  }

  // Check if the reviews object exists
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for the given user." });
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
