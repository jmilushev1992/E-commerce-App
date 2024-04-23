/* eslint-disable linebreak-style */

const express = require('express');
const Book = require('../models/Book');
const User = require('../models/User');
const { getRepos } = require('../github');
const logger = require('../logger');

const router = express.Router();

// Middleware to check if user is an admin
router.use((req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

// Get all books
router.get('/books', async (req, res) => {
  try {
    const booksFromServer = await Book.list();
    res.json(booksFromServer);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

// Add a new book
router.post('/books/add', async (req, res) => {
  try {
    const book = await Book.add({ userId: req.user.id, ...req.body });
    res.json(book);
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

// Edit an existing book
router.post('/books/edit', async (req, res) => {
  try {
    const editedBook = await Book.edit(req.body);
    res.json(editedBook);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

// Get book details by slug
router.get('/books/detail/:slug', async (req, res) => {
  try {
    const bookFromServer = await Book.getBySlug({ slug: req.params.slug });
    res.json(bookFromServer);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

// GitHub-related routes

// Get GitHub repositories
router.get('/github/repos', async (req, res) => {
  const user = await User.findById(req.user._id, 'isGithubConnected githubAccessToken');

  if (!user.isGithubConnected || !user.githubAccessToken) {
    res.json({ error: 'Github not connected' });
    return;
  }

  try {
    const response = await getRepos({ user, request: req });
    res.json({ repos: response.data });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

// Sync book content from GitHub
router.post('/books/sync-content', async (req, res) => {
  const { bookId } = req.body;

  const user = await User.findById(req.user._id, 'isGithubConnected githubAccessToken');

  if (!user.isGithubConnected || !user.githubAccessToken) {
    res.json({ error: 'Github not connected' });
    return;
  }

  try {
    await Book.syncContent({ id: bookId, user, request: req });
    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
