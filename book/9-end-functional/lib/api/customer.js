/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import sendRequest from './sendRequest';

// Base path for customer API
const BASE_PATH = '/api/v1/customer';

// Method to fetch checkout session
export const fetchCheckoutSessionApiMethod = ({ bookId, redirectUrl }) =>
  sendRequest(`${BASE_PATH}/stripe/fetch-checkout-session`, {
    body: JSON.stringify({ bookId, redirectUrl }),
  });

// Method to get the list of my books
export const getMyBookListApiMethod = (options = {}) =>
  sendRequest(`${BASE_PATH}/my-books`, {
    method: 'GET',
    ...options,
  });
