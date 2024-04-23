/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';

import EditBook from '../../components/admin/EditBook';
import { getBookDetailApiMethod, editBookApiMethod } from '../../lib/api/admin';
import withAuth from '../../lib/withAuth';
import notify from '../../lib/notify';

/**
 * Prop types for EditBookPage component.
 */
const propTypes = {
  slug: PropTypes.string.isRequired,
};

/**
 * Component for editing book details.
 * @param {Object} props - Component props.
 * @returns {JSX.Element} - EditBookPage component.
 */
const EditBookPage = ({ slug }) => {
  const [book, setBook] = useState(null);

  useEffect(() => {
    const getBook = async () => {
      NProgress.start();

      try {
        const bookFromServer = await getBookDetailApiMethod({ slug });
        setBook(bookFromServer);
      } catch (err) {
        notify(err.message || err.toString());
      } finally {
        NProgress.done();
      }
    };

    getBook();
  }, []);

  /**
   * Function to handle saving edited book data.
   * @param {Object} data - Edited book data.
   */
  const editBookOnSave = async (data) => {
    NProgress.start();

    try {
      const editedBook = await editBookApiMethod({ ...data, id: book._id });
      notify('Saved');

      Router.push(
        `/admin/book-detail?slug=${editedBook.slug}`,
        `/admin/book-detail/${editedBook.slug}`,
      );
    } catch (err) {
      notify(err);
    } finally {
      NProgress.done();
    }
  };

  if (!book) {
    return null;
  }

  return (
    <div>
      <EditBook onSave={editBookOnSave} book={book} />
    </div>
  );
};

/**
 * Fetches initial props for EditBookPage component.
 * @param {Object} context - Context object.
 * @returns {Object} - Initial props.
 */
EditBookPage.getInitialProps = async ({ query }) => {
  return { slug: query.slug };
};

EditBookPage.propTypes = propTypes;

// Wrap EditBookPage component with authentication requirement (admin)
export default withAuth(EditBookPage, { adminRequired: true });
