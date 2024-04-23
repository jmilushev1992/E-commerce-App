const { Octokit } = require('@octokit/rest');
const fetch = require('node-fetch');
const { oauthAuthorizationUrl } = require('@octokit/oauth-authorization-url');
const _ = require('lodash');

const logger = require('./logger');
const User = require('./models/User');

require('dotenv').config();

// Determine environment variables for GitHub client ID and secret key
const dev = process.env.NODE_ENV !== 'production';
const CLIENT_ID = dev ? process.env.GITHUB_TEST_CLIENTID : process.env.GITHUB_LIVE_CLIENTID;
const API_KEY = dev ? process.env.GITHUB_TEST_SECRETKEY : process.env.GITHUB_LIVE_SECRETKEY;

// Function to set up GitHub authentication routes
function setupGithub({ server, ROOT_URL }) {
  // Function to verify user's GitHub credentials
  const verify = async ({ user, accessToken, profile }) => {
    const modifier = {
      githubId: profile.id,
      githubAccessToken: accessToken,
      githubUsername: profile.login,
      isGithubConnected: true,
    };

    if (!user.displayName) {
      modifier.displayName = profile.name || profile.login;
    }

    if (!user.avatarUrl && profile.avatar_url) {
      modifier.avatarUrl = profile.avatar_url;
    }

    await User.updateOne({ _id: user._id }, modifier);
  };

  // Route to initiate GitHub authentication
  server.get('/auth/github', (req, res) => {
    if (!req.user || !req.user.isAdmin) {
      res.redirect(`${ROOT_URL}/login`);
      return;
    }

    const { url, state } = oauthAuthorizationUrl({
      clientId: CLIENT_ID,
      redirectUrl: `${ROOT_URL}/auth/github/callback`,
      scopes: ['repo', 'user:email'],
      log: { warn: (message) => logger.warn(message) },
    });

    req.session.githubAuthState = state;
    if (req.query && req.query.redirectUrl && req.query.redirectUrl.startsWith('/')) {
      req.session.next_url = req.query.redirectUrl;
    } else {
      req.session.next_url = null;
    }

    res.redirect(url);
  });

  // Route for GitHub authentication callback
  server.get('/auth/github/callback', async (req, res) => {
    if (!req.user) {
      res.redirect(ROOT_URL);
    }

    const { next_url, githubAuthState } = req.session;

    let redirectUrl = ROOT_URL;

    if (next_url && next_url.startsWith('/')) {
      req.session.next_url = null;
      redirectUrl = `${ROOT_URL}${next_url}`;
    }

    if (githubAuthState !== req.query.state) {
      res.redirect(`${redirectUrl}/admin?error=Wrong request`);
    }

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-type': 'application/json;', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: API_KEY,
          code: req.query.code,
          state: req.query.state,
          redirect_uri: `${ROOT_URL}/auth/github/callback`,
        }),
      });

      const resData = await response.json();

      const githubWithAccessToken = new Octokit({
        auth: resData.access_token,
        request: { timeout: 10000 },
      });

      const profile = await githubWithAccessToken.users.getAuthenticated();

      await verify({
        user: req.user,
        accessToken: resData.access_token,
        profile: profile.data,
      });
    } catch (error) {
      logger.error(error.toString());

      res.redirect(`${redirectUrl}/admin?error=${error.toString()}`);
    }

    res.redirect(`${redirectUrl}/admin`);
  });
}

// Function to get Octokit API instance with user's GitHub access token
function getAPI({ user, previews = [], request }) {
  const github = new Octokit({
    auth: user.githubAccessToken,
    previews,
    request: { timeout: 10000 },
    log: {
      info(msg, info) {
        logger.info(`Github API log: ${msg}`, {
          ..._.omit(info, 'headers', 'request', 'body'),
          user: _.pick(user, '_id', 'githubUsername', 'githubId'),
          ..._.pick(request, 'ip', 'hostname'),
        });
      },
    },
  });

  return github;
}

// Function to get repositories for authenticated user
function getRepos({ user, request }) {
  const github = getAPI({ user, request });

  return github.repos.listForAuthenticatedUser({
    visibility: 'private',
    per_page: 100,
    affiliation: 'owner',
  });
}

// Function to get details of a repository
function getRepoDetail({ user, repoName, request, path }) {
  const github = getAPI({ user, request });
  const [owner, repo] = repoName.split('/');

  return github.repos.getContent({ owner, repo, path });
}

// Function to get commits of a repository
function getCommits({ user, repoName, request }) {
  const github = getAPI({ user, request });
  const [owner, repo] = repoName.split('/');

  return github.repos.listCommits({ owner, repo });
}

// Exporting functions for setup and interacting with GitHub
exports.setupGithub = setupGithub;
exports.getRepos = getRepos;
exports.getRepoDetail = getRepoDetail;
exports.getCommits = getCommits;
