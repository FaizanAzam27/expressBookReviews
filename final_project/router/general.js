const express = require('express');
const axios = require('axios'); // Ensure Axios is installed: npm install axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ---------------------------
// Synchronous Endpoints (Tasks 1-5)
// ---------------------------

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  let userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Returning the books object directly as JSON
  return res.status(200).json(books);
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  // Filter the books that match the given author
  const result = Object.values(books).filter(book => book.author === author);
  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  // Filter the books that match the given title
  const result = Object.values(books).filter(book => book.title === title);
  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found for the given title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ---------------------------
// Asynchronous Endpoints Using Async/Await with Axios
// These endpoints call the above synchronous endpoints using Axios.
// ---------------------------

// Task 10: Get the list of books available in the shop (Async)
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    let data = response.data;
    // If data is a string, try parsing it; otherwise assume it's already an object.
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.toString() });
  }
});

// Task 11: Get book details based on ISBN (Async)
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book details", error: error.toString() });
  }
});
  
// Task 12: Get book details based on author (Async)
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.toString() });
  }
});

// Task 13: Get book details based on title (Async)
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by title", error: error.toString() });
  }
});

module.exports.general = public_users;
