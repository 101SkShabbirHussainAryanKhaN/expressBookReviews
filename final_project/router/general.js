const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



// Route to get all books (Async-Await)
public_users.get('/', async function (req, res) {
    try {
        // Simulating an asynchronous operation using Axios
        const booksData = await axios.get('http://localhost:5000/books');
        return res.status(200).json(booksData.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});
// Route to get all books (Using Promises)
public_users.get('/', function (req, res) {
  axios.get('http://localhost:5000/books')
      .then(response => {
          res.status(200).json(response.data);
      })
      .catch(error => {
          res.status(500).json({ message: "Error fetching books", error: error.message });
      });
});
// Route to get book details by ISBN (Async-Await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
      const isbn = req.params.isbn;

      // Fetch book details directly from local database
      if (books[isbn]) {
          return res.status(200).json(books[isbn]);
      } else {
          return res.status(404).json({ message: "Book not found" });
      }

  } catch (error) {
      return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Route to get book details by ISBN (Using Promises)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/books/${isbn}`)
      .then(response => {
          if (response.data) {
              res.status(200).json(response.data);
          } else {
              res.status(404).json({ message: "Book not found" });
          }
      })
      .catch(error => {
          res.status(500).json({ message: "Error fetching book details", error: error.message });
      });
});

// Get books by Author (Async-Await)
public_users.get('/author/:author', async function (req, res) {
  try {
      const author = req.params.author.toLowerCase(); // Convert to lowercase for case-insensitive search
      const matchingBooks = [];

      // Iterate through all books and find those by the given author
      Object.keys(books).forEach(isbn => {
          if (books[isbn].author.toLowerCase() === author) {
              matchingBooks.push(books[isbn]);
          }
      });

      if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks);
      } else {
          return res.status(404).json({ message: "No books found for this author" });
      }

  } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get books by Title (Async-Await)
public_users.get('/title/:title', async function (req, res) {
  try {
      const title = req.params.title.toLowerCase(); // Convert to lowercase for case-insensitive search
      const matchingBooks = [];

      // Iterate through all books and find those matching the title
      Object.keys(books).forEach(isbn => {
          if (books[isbn].title.toLowerCase() === title) {
              matchingBooks.push(books[isbn]);
          }
      });

      if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks);
      } else {
          return res.status(404).json({ message: "No books found with this title" });
      }

  } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book details by ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
      return res.status(200).json(books[isbn]);
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

  

// Get book details by Author
public_users.get("/author/:author", function (req, res) {
  const authorName = req.params.author;
  let booksByAuthor = [];

  // Iterate over the books object to find matches
  for (let key in books) {
      if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
          booksByAuthor.push(books[key]);
      }
  }

  if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
  } else {
      return res.status(404).json({ message: "No books found by this author" });
  }
});
// Get book details by Title
public_users.get("/title/:title", function (req, res) {
  const titleName = req.params.title;
  let foundBook = null;

  // Iterate over the books object to find a matching title
  for (let key in books) {
      if (books[key].title.toLowerCase() === titleName.toLowerCase()) {
          foundBook = books[key];
          break;
      }
  }

  if (foundBook) {
      return res.status(200).json(foundBook);
  } else {
      return res.status(404).json({ message: "No book found with this title" });
  }
});


//  Get book reviews by ISBN
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
      return res.status(200).json(books[isbn].reviews);
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
