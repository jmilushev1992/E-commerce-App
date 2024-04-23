import 'isomorphic-unfetch';
import getRootUrl from './getRootUrl';

/**
 * Sends a request to the server using fetch API.
 * @param {string} path - The path of the API endpoint.
 * @param {object} options - Additional options for the fetch request.
 * @returns {Promise} - A Promise containing the response data.
 */
export default async function sendRequest(path, options = {}) {
  // Set headers including Content-type
  const headers = { ...(options.headers || {}), 'Content-type': 'application/json; charset=UTF-8' };

  // Fetch data from the server
  const response = await fetch(`${getRootUrl()}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    ...options,
    headers,
  });

  // Parse response JSON
  const data = await response.json();

  // Throw error if response contains an error message
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
