/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

const express = require('express');
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');
const { createSession } = require('../stripe');
const logger = require('../logger');

const router = express.Router();

// Middleware to check if user is authenticated
router.use((req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

// Endpoint to fetch checkout session from Stripe
router.post('/stripe/fetch-checkout-session', async (req, res) => {
  try {
    const { bookId, redirectUrl } = req.body;

    // Find the book by ID
    const book = await Book.findById(bookId).select(['slug']).setOptions({ lean: true });

    if (!book) {
      throw new Error('Book not found');
    }

    // Check if the user has already purchased the book
    const isPurchased =
      (await Purchase.find({ userId: req.user._id, bookId: book._id }).countDocuments()) > 0;
    if (isPurchased) {
      throw new Error('You already bought this book.');
    }

    // Create a checkout session with Stripe
    const session = await createSession({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      bookId,
      bookSlug: book.slug,
      redirectUrl,
    });

    res.json({ sessionId: session.id
