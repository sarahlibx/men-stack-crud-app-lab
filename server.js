const dotenv = require("dotenv");
dotenv.config(); // Loads the environment variables from .env file
const express = require('express');
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
 const path = require("path");
const app = express();

// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);

// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); // new
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

// import books model
const Book = require("./models/books.js");

app.use(express.urlencoded({ extended: false }));

// GET / homepage: views.index.ejs
app.get("/", async (req, res) => {
   res.render("index.ejs");
});

// GET /books/new
app.get("/books/new", (req, res) => {
  res.render("books/new.ejs");
});

// GET /books
app.get("/books", async (req, res) => {
    const allBooks = await Book.find();
    console.log(allBooks);
    res.render("books/index.ejs", { books: allBooks });
});

// GET /book by ID
app.get("/books/:bookId", async (req, res) => {
  const foundBook = await Book.findById(req.params.bookId);
  res.render("books/show.ejs", { book: foundBook });
});

// GET localhost:3000/fruits/:fruitId/edit
app.get("/books/:bookId/edit", async (req, res) => {
  const foundBook = await Book.findById(req.params.bookId);
  res.render('books/edit.ejs', {
    book: foundBook,
  });
});

// POST /books 
app.post("/books", async (req, res) => {
    console.log(req.body);
  if (req.body.isRead === "on") {
    req.body.isRead = true;
  } else {
    req.body.isRead = false;
  }
  await Book.create(req.body);
  res.redirect("/books");
});

// UPDATE (edit) /books/edit
app.put("/books/:bookId", async (req, res) => {
    if (req.body.isRead === "on") {
    req.body.isRead = true;
  } else {
    req.body.isRead = false;
  }
  
  // Update the fruit in the database
  await Book.findByIdAndUpdate(req.params.bookId, req.body);

  // Redirect to the fruit's show page to see the updates
  res.redirect(`/books/${req.params.bookId}`);
});

// DELETE /books/show
app.delete('/books/:bookId', async (req, res) => {
    await Book.findByIdAndDelete(req.params.bookId);
    res.redirect('/books');
})

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
