/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';

import { getMyBookListApiMethod } from '../../lib/api/customer';
import withAuth from '../../lib/withAuth';

/**
 * PropTypes for the MyBooks component.
 */
const propTypes = {
  purchasedBooks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  ),
};

/**
 * Default props for the MyBooks component.
 */
const defaultProps = {
  purchasedBooks: [],
};

/**
 * Component for displaying the list of purchased books.
 * @param {Object} props - Component props.
 * @returns {JSX.Element} - MyBooks component.
 */
const MyBooks = ({ purchasedBooks }) => {
  return (
    <div>
      <Head>
        <title>My Books</title>
      </Head>
      <div style={{ padding: '10px 45px' }}>
        {purchasedBooks && purchasedBooks.length > 0 ? (
          <div>
            <h3>Your books</h3>
            <ul>
              {purchasedBooks.map((book) => (
                <li key={book._id}>
                  <Link
                    as={`/books/${book.slug}/introduction`}
                    href={`/public/read-chapter?bookSlug=${book.slug}&chapterSlug=introduction`}
                  >
                    {book.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h3>Your books</h3>
            <p>You have not purchased any book.</p>
          </div>
        )}
      </div>
    </div>
  );
};

MyBooks.propTypes = propTypes;
MyBooks.defaultProps = defaultProps;

/**
 * Fetches the list of purchased books for the user.
 * @param {Object} context - Context object containing request and response objects.
 * @returns {Object} - Object containing the list of purchased books.
 */
MyBooks.getInitialProps = async ({ req, res }) => {
  if (req && !req.user) {
    res.redirect('/login');
    return { purchasedBooks: [] };
  }

  const headers = {};
  if (req && req.headers && req.headers.cookie) {
    headers.cookie = req.headers.cookie;
  }

  const { purchasedBooks } = await getMyBookListApiMethod({ headers });

  return { purchasedBooks };
};

// Wrap MyBooks component with authentication requirement
export default withAuth(MyBooks);
