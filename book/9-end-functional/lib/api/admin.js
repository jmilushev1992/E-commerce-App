/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import sendRequest from './sendRequest';

// Base path for admin API
const BASE_PATH = '/api/v1/admin';

// Method to get the list of books
export const getBookListApiMethod = () =>
  sendRequest(`${BASE_PATH}/books`, {
    method: 'GET',
  });

// Method to add a book
export const addBookApiMethod = ({ name, price, githubRepo }) =>
  sendRequest(`${BASE_PATH}/books/add`, {
    body: JSON.stringify({ name, price, githubRepo }),
  });

// Method to edit a book
export const editBookApiMethod = ({ id, name, price, githubRepo }) =>
  sendRequest(`${BASE_PATH}/books/edit`, {
    body: JSON.stringify({
      id,
      name,
      price,
      githubRepo,
    }),
  });

// Method to get details of a book
export const getBookDetailApiMethod = ({ slug }) =>
  sendRequest(`${BASE_PATH}/books/detail/${slug}`, {
    method: 'GET',
  });

// GitHub methods

// Method to get GitHub repositories
export const getGithubReposApiMethod = () =>
  sendRequest(`${BASE_PATH}/github/repos`, {
    method: 'GET',
  });

// Method to sync book content
export const syncBookContentApiMethod = ({ bookId }) =>
  sendRequest(`${BASE_PATH}/books/sync-content`, {
    body: JSON.stringify({ bookId }),
  });
