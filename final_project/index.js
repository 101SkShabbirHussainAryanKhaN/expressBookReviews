const express = require('express');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
// const genl_routes = require('./router/general.js');
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js');

const app = express();

app.use(express.json());

// Configure session middleware
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.user) {
        next();  // User is logged in, proceed to the next middleware/route
    } else {
        res.status(403).json({ message: "Access Denied. Please log in first." });
    }
});

// Get all books (Added this route if needed)
app.get("/books", (req, res) => {
    res.json(books);
});

// Use the imported routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
