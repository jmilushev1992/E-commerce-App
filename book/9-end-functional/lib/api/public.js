import sendRequest from './sendRequest';

const BASE_PATH = '/api/v1/public';

// API method to fetch book details
export const getBookDetailApiMethod = ({ slug }) =>
  sendRequest(`${BASE_PATH}/books/${slug}`, {
    method: 'GET',
  });

// API method to fetch chapter details
export const getChapterDetailApiMethod = ({ bookSlug, chapterSlug }, options = {}) =>
  sendRequest(`${BASE_PATH}/get-chapter-detail?bookSlug=${bookSlug}&chapterSlug=${chapterSlug}`, {
    method: 'GET',
    ...options,
  });
