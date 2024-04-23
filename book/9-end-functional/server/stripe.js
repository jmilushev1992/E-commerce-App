/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

// Import necessary modules
const Stripe = require('stripe');
const lodash = require('lodash');

const Book = require('./models/Book');
const User = require('./models/User');
const logger = require('./logger');

const getRootUrl = require('../lib/api/getRootUrl');

// Determine environment and set API key and root URL accordingly
const dev = process.env.NODE_ENV !== 'production';
const API_KEY = dev ? process.env.STRIPE_TEST_SECRETKEY : process.env.STRIPE_LIVE_SECRETKEY;
const ROOT_URL = getRootUrl();

// Create a Stripe instance with the API key
const stripeInstance = new Stripe(API_KEY, { apiVersion: '2020-08-27' });

// Function to get the price ID of a book based on its slug
function getBookPriceId(bookSlug) {
  let priceId;

  // Set price ID based on the book slug and environment
  if (bookSlug === 'demo-book') {
    priceId = dev
      ? process.env.STRIPE_TEST_DEMO_BOOK_PRICE_ID
      : process.env.STRIPE_LIVE_DEMO_BOOK_PRICE_ID;
  } else if (bookSlug === 'second-book') {
    priceId = dev
      ? process.env.STRIPE_TEST_SECOND_BOOK_PRICE_ID
      : process.env.STRIPE_LIVE_SECOND_BOOK_PRICE_ID;
  } else {
    throw new Error('Wrong book');
  }

  return priceId;
}

// Function to create a checkout session
function createSession({ userId, bookId, bookSlug, userEmail, redirectUrl }) {
  logger.info(userId, bookId, bookSlug, userEmail, redirectUrl);
  // Create and return a checkout session object
  return stripeInstance.checkout.sessions.create({
    customer_email: userEmail,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{ price: getBookPriceId(bookSlug), quantity: 1 }],
    success_url: `${ROOT_URL}/stripe/checkout-completed/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${ROOT_URL}${redirectUrl}?checkout_canceled=1`,
    metadata: { userId, bookId, redirectUrl },
  });
}

// Function to retrieve a session using its ID
function retrieveSession({ sessionId }) {
  return stripeInstance.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'payment_intent.payment_method'],
  });
}

// Route handler for Stripe checkout completion callback
function stripeCheckoutCallback({ server }) {
  server.get('/stripe/checkout-completed/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const session = await retrieveSession({ sessionId });

    try {
      // Check if session and metadata exist and contain necessary information
      if (
        !session ||
        !session.metadata ||
        !session.metadata.userId ||
        !session.metadata.bookId ||
        !session.metadata.redirectUrl
      ) {
        throw new Error('Wrong session.');
      }

      // Find user and book associated with the session
      const user = await User.findById(
        session.metadata.userId,
        '_id email purchasedBookIds freeBookIds',
      ).lean();

      const book = await Book.findOne({ _id: session.metadata.bookId }, 'name slug price').lean();

      // Throw errors if user or book not found
      if (!user) {
        throw new Error('User not found.');
      }

      if (!book) {
        throw new Error('Book not found.');
      }

      // Process payment if session mode is 'payment'
      if (session.mode === 'payment') {
        await Book.buy({
          book,
          user,
          stripeCharge: lodash.get(session, 'payment_intent.charges.data.0'),
        });
      } else {
        throw new Error('Wrong session.');
      }

      // Redirect to the specified URL after successful checkout
      res.redirect(`${ROOT_URL}${session.metadata.redirectUrl}`);
    } catch (err) {
      // Handle errors and redirect with error message
      logger.error(err);
      res.redirect(
        `${ROOT_URL}${session.metadata.redirectUrl}?error=${err.message || err.toString()}`,
      );
    }
  });
}

// Export functions for creating checkout session and handling checkout completion callback
exports.createSession = createSession;
exports.stripeCheckoutCallback = stripeCheckoutCallback;
