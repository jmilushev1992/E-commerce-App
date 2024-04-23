/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

// Function to get the root URL based on environment
function getRootUrl() {
  // Determine if in development or production environment
  const dev = process.env.NODE_ENV !== 'production';
  // Define the root URL based on the environment
  const ROOT_URL = dev
    ? process.env.NEXT_PUBLIC_URL_APP // Development URL
    : process.env.NEXT_PUBLIC_PRODUCTION_URL_APP; // Production URL

  return ROOT_URL; // Return the determined root URL
}

module.exports = getRootUrl; // Export the getRootUrl function
