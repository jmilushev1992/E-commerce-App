/* eslint-disable linebreak-style */

// Importing API routes for different user roles
const publicApi = require('./public');
const customerApi = require('./customer');
const adminApi = require('./admin');

// Function to set up API routes
function api(server) {
  // Set up routes for public endpoints
  server.use('/api/v1/public', publicApi);
  // Set up routes for customer endpoints
  server.use('/api/v1/customer', customerApi);
  // Set up routes for admin endpoints
  server.use('/api/v1/admin', adminApi);
}

module.exports = api;
