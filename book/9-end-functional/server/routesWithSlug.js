/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

// Function to define routes with slug parameters
function routesWithSlug({ server, app }) {
  // Route to render the page for reading a chapter
  server.get('/books/:bookSlug/:chapterSlug', (req, res) => {
    // Extract bookSlug and chapterSlug from request parameters
    const { bookSlug, chapterSlug } = req.params;
    // Render the read-chapter page and pass bookSlug, chapterSlug, and query parameters
    app.render(req, res, '/public/read-chapter', { bookSlug, chapterSlug, ...(req.query || {}) });
  });

  // Route to render the book detail page in the admin section
  server.get('/admin/book-detail/:slug', (req, res) => {
    // Extract slug parameter from request parameters
    const { slug } = req.params;
    // Render the book-detail page and pass the slug parameter
    app.render(req, res, '/admin/book-detail', { slug });
  });

  // Route to render the edit book page in the admin section
  server.get('/admin/edit-book/:slug', (req, res) => {
    // Extract slug parameter from request parameters
    const { slug } = req.params;
    // Render the edit-book page and pass the slug parameter
    app.render(req, res, '/admin/edit-book', { slug });
  });
}

// Export the routesWithSlug function
module.exports = routesWithSlug;
