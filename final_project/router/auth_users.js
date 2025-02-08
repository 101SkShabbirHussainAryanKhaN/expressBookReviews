const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Sample user database
let users = [
    { username: "customer1", password: "password123" }
];

const SECRET_KEY = "fingerprint_customer"; // Use a secure key

// Function to check if username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};
// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    if (isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Register the user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Function to authenticate user credentials
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Implement login functionality
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    // Store the session (Express session is already configured in index.js)
    req.session.user = { username, token };

    return res.status(200).json({ message: "Login successful", token });
});

//  Add or Modify Book Review
regd_users.use((req, res, next) => {
    if (!req.session.username) {
        return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }
    next();
});
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Extract ISBN from URL
    const { review } = req.body; // Extract review from request body

    //  Check if user is logged in
    if (!req.session.token) {
        return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }

    //  Decode JWT Token to get the username
    let decodedUser;
    try {
        decodedUser = jwt.verify(req.session.token, SECRET_KEY);
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }

    const username = decodedUser.username;

    //  Check if ISBN exists in the books database
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    //  Initialize the reviews object if not already present
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    //  Add or update the review for the user
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.username; // Get username from session
    const isbn = req.params.isbn; // Get ISBN from URL params

    if (!username) {
        return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }

    // Check if the book exists in the database
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user on this book" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

//  Logout route
regd_users.get("/logout", (req, res) => {
    req.session.destroy(); // Clear session on logout
    return res.status(200).json({ message: "Logged out successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
