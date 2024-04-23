/* eslint-disable linebreak-style */

// Import necessary modules
const express = require('express');
const session = require('express-session');
const mongoSessionStore = require('connect-mongo');
const next = require('next');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');

// Import setup functions
const setupGoogle = require('./google');
const { setupGithub } = require('./github');
const api = require('./api');
const routesWithSlug = require('./routesWithSlug');
const getRootUrl = require('../lib/api/getRootUrl');
const setupSitemapAndRobots = require('./sitemapAndRobots');
const { stripeCheckoutCallback } = require('./stripe');

// Import logger and environment variables
const logger = require('./logger');
require('dotenv').config();

// Determine MongoDB URL based on environment
const dev = process.env.NODE_ENV !== 'production';
const MONGO_URL = dev ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;

// Connect to MongoDB
(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URL);
    logger.info('connected to db');

    // Perform any async tasks after connecting to the database
    // logger.info('finished async tasks');
  } catch (err) {
    logger.error(`error: ${err}`);
  }
})();

// Determine the port and root URL for the server
const port = process.env.PORT || 8000;
const ROOT_URL = getRootUrl();

// Map specific URLs to corresponding Next.js routes
const URL_MAP = {
  '/login': '/public/login',
  '/my-books': '/customer/my-books',
};

// Create a Next.js app instance
const app = next({ dev });
const handle = app.getRequestHandler();

// Prepare the Next.js app
app.prepare().then(async () => {
  // Create an Express server
  const server = express();

  // Set up security and compression middleware
  server.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  server.use(compression());

  // Parse JSON bodies
  server.use(express.json());

  // Route Next.js requests to the Next.js server
  server.get('/_next/*', (req, res) => {
    handle(req, res);
  });

  // Configure session options
  const sessionOptions = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    store: mongoSessionStore.create({
      mongoUrl: MONGO_URL,
      ttl: 14 * 24 * 60 * 60, // save session for 14 days
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
      domain: dev ? 'localhost' : process.env.COOKIE_DOMAIN,
    },
  };

  // Enable secure cookies in production
  if (!dev) {
    server.set('trust proxy', 1); // sets req.hostname, req.ip
    sessionOptions.cookie.secure = true; // sets cookie over HTTPS only
  }

  // Set up session middleware
  const sessionMiddleware = session(sessionOptions);
  server.use(sessionMiddleware);

  // Call setup functions for Google OAuth, GitHub OAuth, API routes, slug routes, Stripe callbacks, sitemap, and robots.txt
  setupGoogle({ server, ROOT_URL });
  setupGithub({ server, ROOT_URL });
  api(server);
  routesWithSlug({ server, app });
  stripeCheckoutCallback({ server });
  setupSitemapAndRobots({ server });

  // Handle all other routes
  server.get('*', (req, res) => {
    const url = URL_MAP[req.path];
    if (url) {
      app.render(req, res, url);
    } else {
      handle(req, res);
    }
  });

  // Start the server
  server.listen(port, (err) => {
    if (err) throw err;
    logger.info(`> Ready on ${ROOT_URL}`);
  });
});
