/* eslint-disable linebreak-style */

// Import necessary modules
const { SitemapStream, streamToPromise } = require('sitemap');
const path = require('path');
const zlib = require('zlib');
const Chapter = require('./models/Chapter');
const logger = require('./logger');
const getRootUrl = require('../lib/api/getRootUrl');

// Get the root URL for the server
const ROOT_URL = getRootUrl();

// Function to set up sitemap and robots.txt routes
function setupSitemapAndRobots({ server }) {
  let sitemap;

  // Sitemap route handler
  server.get('/sitemap.xml', async (_, res) => {
    // Set headers for XML content and gzip compression
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    // If sitemap is already generated, send it directly
    if (sitemap) {
      res.send(sitemap);
      return;
    }

    try {
      // Create a new SitemapStream instance
      const smStream = new SitemapStream({
        hostname: ROOT_URL, // Set the hostname for the URLs in the sitemap
      });
      const gzip = zlib.createGzip(); // Create a gzip stream

      // Fetch all chapters from the database
      const chapters = await Chapter.find({}, 'slug').sort({ order: 1 }).lean();

      // Iterate over chapters and add them to the sitemap
      if (chapters && chapters.length > 0) {
        for (const chapter of chapters) {
          smStream.write({
            url: `/books/builder-book/${chapter.slug}`, // URL for each chapter
            changefreq: 'daily', // Change frequency
            priority: 1, // Priority
          });
        }
      }

      // Add other URLs to the sitemap
      smStream.write({
        url: '/', // Root URL
        changefreq: 'weekly', // Change frequency
        priority: 1, // Priority
      });

      smStream.write({
        url: '/login', // Login page URL
        changefreq: 'weekly', // Change frequency
        priority: 1, // Priority
      });

      // Convert the sitemap stream to a promise and compress it with gzip
      streamToPromise(smStream.pipe(gzip)).then((sm) => (sitemap = sm));

      smStream.end(); // End the stream

      // Pipe the compressed sitemap to the response
      smStream.pipe(gzip).pipe(res).on('error', (err) => {
        throw err; // Handle errors
      });
    } catch (err) {
      logger.debug(err); // Log errors
      res.status(500).end(); // Send 500 status in case of error
    }
  });

  // Robots.txt route handler
  server.get('/robots.txt', (_, res) => {
    // Send the robots.txt file
    res.sendFile(path.join(__dirname, '../public', 'robots.txt'));
  });
}

module.exports = setupSitemapAndRobots; // Export the setupSitemapAndRobots function
