const fetch = require('node-fetch');

// Load environment variables from .env file
require('dotenv').config();

// Define the list IDs for Mailchimp lists
const LIST_IDS = {
  signedup: process.env.MAILCHIMP_SIGNEDUP_LIST_ID, // List ID for signed-up users
  purchased: process.env.MAILCHIMP_PURCHASED_LIST_ID, // List ID for purchased users
};

// Function to make a call to the Mailchimp API
function callAPI({ path, method, data }) {
  // Construct the root URI for Mailchimp API based on the region
  const ROOT_URI = `https://${process.env.MAILCHIMP_REGION}.api.mailchimp.com/3.0`;

  // Make a fetch request to Mailchimp API
  return fetch(`${ROOT_URI}${path}`, {
    method, // HTTP method (GET, POST, etc.)
    headers: {
      Accept: 'application/json',
      // Include authorization header with API key (using Basic Auth)
      Authorization: `Basic ${Buffer.from(`apikey:${process.env.MAILCHIMP_API_KEY}`).toString('base64')}`,
    },
    body: JSON.stringify(data), // Convert data to JSON string and include in the request body
  });
}

// Function to add an email to a Mailchimp list
async function addToMailchimp({ email, listName }) {
  // Prepare data object with email address and status for subscription
  const data = {
    email_address: email,
    status: 'subscribed', // User status (subscribed, pending, etc.)
  };

  // Construct the API path for adding a member to the specified list
  const path = `/lists/${LIST_IDS[listName]}/members/`;

  // Log the API path and email address to be added (for debugging)
  console.log(path, data.email_address);

  // Make a POST request to Mailchimp API to add the email to the list
  await callAPI({ path, method: 'POST', data });
}

// Export the function for adding email to Mailchimp list
exports.addToMailchimp = addToMailchimp;
