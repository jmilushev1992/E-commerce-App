/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

let globalUser = null;

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false, adminRequired = false } = {},
) {
  class App extends React.Component {
    static async getInitialProps(ctx) {
      const isFromServer = typeof window === 'undefined';
      const user = ctx.req ? ctx.req.user : globalUser;

      if (isFromServer && user) {
        user._id = user._id.toString();
      }

      const props = { user, isFromServer };

      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      const { user, isFromServer } = this.props;

      if (isFromServer) {
        globalUser = user;
      }

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

  const propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      isAdmin: PropTypes.bool,
    }),
    isFromServer: PropTypes.bool.isRequired,
  };

  const defaultProps = {
    user: null,
  };

  App.propTypes = propTypes;
  App.defaultProps = defaultProps;

  return App;
}
