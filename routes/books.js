var express = require("express");
var router = express.Router();
const Book = require("../models").Book;

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

/* GET list of books */
// 1st page
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll(
      { limit: 10 },
      { order: [["id", "DESC"]] }
    );
    res.render("books/index", { books, title: "All Books" });
  })
);

// 2nd page
router.get(
  "/page2",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll(
      { offset: 10, limit: 10 },
      { order: [["id", "DESC"]] }
    );
    res.render("books/index", { books, title: "All Books" });
  })
);

// future to do- findandcountall https://sequelize.org/master/manual/model-querying-finders.html

/* create new book */
router.get(
  "/new",
  asyncHandler(async (req, res) => {
    res.render("books/new-book", { book: {}, title: "New Book" });
  })
);

/* POST create new book*/
router.post(
  "/",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("books/new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

/* GET an individual book */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/update-book", { book, title: "Update Book" });
    } else {
      res.render("error");
    }
  })
);

/* Update a book */
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      await book.update(req.body);
      res.redirect("/books");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("books/update-book", {
          book,
          errors: error.errors,
          title: "Update Book",
        });
      } else {
        res.sendStatus(404);
      }
    }
  })
);

/* Delete Book? */
router.get(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/delete", { book, title: book.title });
    } else {
      res.sendStatus(404);
    }
  })
);

/* Yes Delete Book */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;
