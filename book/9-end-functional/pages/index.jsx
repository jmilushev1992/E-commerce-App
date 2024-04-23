/* eslint-disable linebreak-style */
// eslint-disable-next-line no-multiple-empty-lines

import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

import withAuth from '../lib/withAuth';

const propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }),
};

const defaultProps = {
  user: null,
};

// Component for displaying user settings
class Index extends React.Component {
  render() {
    const { user } = this.props;
    return (
      <div style={{ padding: '10px 45px' }}>
        <Head>
          <title>Settings</title>
          <meta name="description" content="List of purchased books." />
        </Head>
        <p>List of purchased books</p>
        <p>Email:&nbsp;{user.email}</p>
      </div>
    );
  }
}

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;

export default withAuth(Index); // Wrap component with authentication HOC
