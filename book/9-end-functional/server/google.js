const passport = require('passport');
const Strategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('./models/User');

// Function to set up Google OAuth authentication
function setupGoogle({ server, ROOT_URL }) {
  // Function to verify user's Google credentials
  const verify = async (accessToken, refreshToken, profile, verified) => {
    let email;
    let avatarUrl;

    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.photos && profile.photos.length > 0) {
      avatarUrl = profile.photos[0].value.replace('sz=50', 'sz=128');
    }

    try {
      const user = await User.signInOrSignUp({
        googleId: profile.id,
        email,
        googleToken: { accessToken, refreshToken }, // Saving Google tokens for the user
        displayName: profile.displayName,
        avatarUrl,
      });
      verified(null, user);
    } catch (err) {
      verified(err);
      console.log(err); // Log any errors during user sign-in or sign-up
    }
  };

  // Configure Google OAuth 2.0 strategy
  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET,
        callbackURL: `${ROOT_URL}/oauth2callback`, // Callback URL after authentication
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo', // Google user profile API URL
      },
      verify,
    ),
  );

  // Serialize user for session storage
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session storage
  passport.deserializeUser((id, done) => {
    User.findById(id, User.publicFields())
      .then(user => {
        done(null, user);
      })
      .catch(error => {
        done(error, null);
      });
  });

  // Initialize passport middleware
  server.use(passport.initialize());
  server.use(passport.session());

  // Route to initiate Google OAuth authentication
  server.get('/auth/google', (req, res, next) => {
    const options = {
      scope: ['profile', 'email'], // Requested user data scopes
      prompt: 'select_account', // Prompt user to select account if multiple are available
    };

    if (req.query && req.query.redirectUrl && req.query.redirectUrl.startsWith('/')) {
      req.session.finalUrl = req.query.redirectUrl; // Save redirect URL in session for later use
    } else {
      req.session.finalUrl = null;
    }

    passport.authenticate('google', options)(req, res, next);
  });

  // Route for Google OAuth callback after authentication
  server.get(
    '/oauth2callback',
    passport.authenticate('google', {
      failureRedirect: '/login', // Redirect to login page if authentication fails
    }),
    (req, res) => {
      if (req.user && req.user.isAdmin) {
        res.redirect('/admin'); // Redirect admin users to admin dashboard
      } else if (req.user && req.session.finalUrl) {
        res.redirect(`${ROOT_URL}${req.session.finalUrl}`); // Redirect to final URL after authentication
      } else {
        res.redirect('/my-books'); // Redirect regular users to my-books page
      }
    },
  );

  // Route for user logout
  server.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        next(err);
      }
      res.redirect('/login'); // Redirect to login page after logout
    });
  });
}

module.exports = setupGoogle;

// Check if need googleToken as field for User data model
