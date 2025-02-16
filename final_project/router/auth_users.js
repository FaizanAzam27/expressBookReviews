const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper: Check if a username is valid (i.e. not already taken)
const isValid = (username) => {
  // Returns false if username already exists in users array
  let user = users.find(user => user.username === username);
  return user ? false : true;
}

// Helper: Check if username and password match an existing user
const authenticatedUser = (username, password) => {
  let user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
}

// Task 7: Login as a registered user
// Endpoint: /customer/login (remember that regd_users is mounted under "/customer")
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  // Validate that both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  // Check if credentials match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  
  // Generate a JWT token; you can adjust the secret key and expiration as needed
  let accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });
  
  // Save token and username in the session's authorization object
  req.session.authorization = { accessToken, username };
  
  return res.status(200).json({ message: "Customer successfully logged in", token: accessToken });
});

// Task 8: Add or modify a book review
// Endpoint: /customer/auth/review/:isbn
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Review is passed as a query parameter
  
  // Check that a review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  
  // Retrieve username from the session authorization object
  const username = req.session.authorization.username;
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  // Initialize the reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  
  // Add or modify the review for the user
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({ message: "Review successfully added/modified", reviews: books[isbn].reviews });
});

// Task 9: Delete a book review (only the user who added the review can delete it)
// Endpoint: /customer/auth/review/:isbn
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  // Check if the review for this user exists
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "Review not found for the user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
