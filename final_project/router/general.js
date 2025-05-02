const express = require('express');
let books = require("./booksdb.js"); 
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users; 
const public_users = express.Router();
const getAllBooks = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Book data source is not available."));
        }
    });
};

// Task 11 (Helper): Get book by ISBN - returns a Promise
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const isbnNum = parseInt(isbn); // Or keep as string if keys are strings
        const book = books[isbnNum];
        if (book) {
            resolve(book);
        } else {
            // Reject with an error object containing status and message
            reject({ status: 404, message: `Book with ISBN ${isbn} not found.` });
        }
    });
};

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password fields cannot be empty." });
    }

    // Check if username already exists (using Array.prototype.some for efficiency)
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: `Username '${username}' already exists.` });
    }

    // Add new user
    users.push({ username: username, password: password }); // Password should ideally be hashed
    console.log("Registered users:", users); // Log for debugging
    return res.status(201).json({ message: "User registered successfully. You can now login." });
});

// Task 1 & Task 10: Get the list of all books available
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await getAllBooks();
        res.json(allBooks); // Simpler way to send JSON
    } catch (error) {
        console.error("Error fetching all books:", error);
        res.status(500).json({ message: "Failed to retrieve book list." });
    }
});

// Task 2 & Task 11: Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBN(isbn);
        res.json(book);
    } catch (error) {
        // Handle errors rejected from getBookByISBN (or other potential errors)
        console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
        const statusCode = error.status || 500; // Use status from error object or default to 500
        res.status(statusCode).json({ message: error.message || "Internal server error." });
    }
});

// Task 3 & Task 12: Get book details based on Author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const allBooks = await getAllBooks();
        const booksArray = Object.values(allBooks); // Convert book object to array
        const booksByAuthor = booksArray.filter(book => book.author.toLowerCase() === author.toLowerCase());

        if (booksByAuthor.length > 0) {
            res.json(booksByAuthor);
        } else {
            res.status(404).json({ message: `No books found by author '${author}'.` });
        }
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error);
        res.status(500).json({ message: "Failed to retrieve books by author." });
    }
});

// Task 4 & Task 12: Get book details based on Title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const allBooks = await getAllBooks();
        const booksArray = Object.values(allBooks); // Convert book object to array
        const booksByTitle = booksArray.filter(book => book.title.toLowerCase() === title.toLowerCase());

        if (booksByTitle.length > 0) {
            res.json(booksByTitle);
        } else {
            res.status(404).json({ message: `No books found with title '${title}'.` });
        }
    } catch (error) {
        console.error(`Error fetching books by title ${title}:`, error);
        res.status(500).json({ message: "Failed to retrieve books by title." });
    }
});

// Task 5 & Task 13: Get book reviews based on ISBN
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBN(isbn); // Reuse the ISBN helper
        // Check if the book object actually has reviews
        if (book.reviews) {
            res.json(book.reviews);
        } else {
            res.json({}); // Send empty object if no reviews found
        }
    } catch (error) {
        // Handle errors rejected from getBookByISBN (like book not found)
        console.error(`Error fetching reviews for ISBN ${isbn}:`, error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).json({ message: error.message || "Internal server error fetching reviews." });
    }
});

module.exports.general = public_users;