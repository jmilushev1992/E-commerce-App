/* eslint-disable linebreak-style */
// eslint-disable-next-line no-multiple-empty-lines

import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';

import withAuth from '../../lib/withAuth';
import EditBook from '../../components/admin/EditBook';
import { addBookApiMethod, syncBookContentApiMethod } from '../../lib/api/admin';
import notify from '../../lib/notify';

/**
 * Page component for adding a new book.
 * @returns {JSX.Element} - AddBook component.
 */
const AddBook = () => {
  /**
   * Function to handle saving a new book.
   * @param {Object} data - Book data to be saved.
   */
  const addBookOnSave = async (data) => {
    NProgress.start(); // Start progress bar

    try {
      // Add new book
      const book = await addBookApiMethod(data);
      notify('Saved');

      try {
        const bookId = book._id;
        // Sync book content
        await syncBookContentApiMethod({ bookId });
        notify('Synced');
        NProgress.done(); // Complete progress bar
        // Redirect to book detail page
        Router.push(`/admin/book-detail?slug=${book.slug}`, `/admin/book-detail/${book.slug}`);
      } catch (err) {
        notify(err.message || err.toString());
        NProgress.done(); // Complete progress bar
      }
    } catch (err) {
      notify(err.message || err.toString());
      NProgress.done(); // Complete progress bar
    }
  };

  return (
    <div style={{ padding: '10px 45px' }}>
      <EditBook onSave={addBookOnSave} />
    </div>
  );
};

// Wrap AddBook component with authentication requirement (admin)
export default withAuth(AddBook, { adminRequired: true });
