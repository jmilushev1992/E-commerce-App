/* eslint-disable linebreak-style */ // Disabling linebreak style linting rule

// eslint-disable-next-line no-multiple-empty-lines // Disabling linting rule for multiple empty lines

import Head from 'next/head';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import withAuth from '../../lib/withAuth';

const propTypes = {
  router: PropTypes.shape({
    query: PropTypes.shape({
      redirectUrl: PropTypes.string,
    }),
  }).isRequired,
};

const Login = ({ router }) => {
  // Extracting redirect URL from router query or setting it to an empty string
  const redirectUrl = (router && router.query && router.query.redirectUrl) || '';

  return (
    <div style={{ textAlign: 'center', margin: '0 20px' }}>
      <Head>
        <title>Log in to Builder Book</title>
        <meta name="description" content="Login page for builderbook.org" />
      </Head>
      <br />
      <p style={{ margin: '45px auto', fontSize: '44px', fontWeight: '400' }}>Log in</p>
      <p>You’ll be logged in for 14 days unless you log out manually.</p>
      <br />
      {/* Log in button with Google */}
      <Button
        variant="contained"
        color="secondary"
        href={`/auth/google?redirectUrl=${redirectUrl}`}
      >
        <img
          src="https://builderbook-public.s3.amazonaws.com/G.svg"
          alt="Log in with Google"
          style={{ marginRight: '10px' }}
        />
        Log in with Google
      </Button>
    </div>
  );
};

Login.propTypes = propTypes; // Prop type validation

// Exporting Login component with authentication and withRouter higher order components
export default withAuth(withRouter(Login), { logoutRequired: true });
