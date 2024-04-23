/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

// Global variable to store user information
let globalUser = null;

/**
 * Higher-order component for handling authentication logic.
 * @param {React.Component} BaseComponent - The base component to wrap with authentication logic.
 * @param {Object} options - Options for authentication requirements.
 * @param {boolean} options.loginRequired - Whether login is required for accessing the component.
 * @param {boolean} options.logoutRequired - Whether logout is required for accessing the component.
 * @param {boolean} options.adminRequired - Whether admin access is required for accessing the component.
 * @returns {React.Component} - The wrapped component with authentication logic.
 */
export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false, adminRequired = false } = {},
) {
  class App extends React.Component {
    /**
     * Retrieves initial props, including user information.
     * @param {Object} ctx - The context object.
     * @returns {Object} - The initial props.
     */
    static async getInitialProps(ctx) {
      const isFromServer = typeof window === 'undefined'; // Check if request is from server
      const user = ctx.req ? ctx.req.user : globalUser; // Get user from request or global variable

      // Convert user id to string if from server
      if (isFromServer && user) {
        user._id = user._id.toString();
      }

      // Set initial props with user information
      const props = { user, isFromServer };

      // If base component has getInitialProps method, call it and merge props
      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      const { user, isFromServer } = this.props;

      // If request is from server, set global user variable
      if (isFromServer) {
        globalUser = user;
      }

      // Handle authentication logic based on options
      if (loginRequired && !logoutRequired && !user) {
        Router.push('/public/login', '/login');
        return;
      }

      if (adminRequired && user && !user.isAdmin) {
        Router.push('/customer/my-books', '/my-books');
      }

      if (logoutRequired && user) {
        if (!user.isAdmin) {
          Router.push('/customer/my-books', '/my-books');
          return;
        }

        Router.push('/admin');
      }
    }

    render() {
      const { user } = this.props;

      // Render the base component or null based on authentication requirements
      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (adminRequired && user && !user.isAdmin) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      return <BaseComponent {...this.props} />;
    }
  }

  // Prop types for the wrapped component
  const propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      isAdmin: PropTypes.bool,
    }),
    isFromServer: PropTypes.bool.isRequired,
  };

  // Default props for the wrapped component
  const defaultProps = {
    user: null,
  };

  // Assign prop types and default props to the wrapped component
  App.propTypes = propTypes;
  App.defaultProps = defaultProps;

  return App; // Return the wrapped component
}
