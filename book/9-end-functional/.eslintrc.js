/* eslint-disable linebreak-style */

// Configuration for ESLint
module.exports = {
  // Use Babel parser for parsing JavaScript files
  parser: '@babel/eslint-parser',
  parserOptions: {
    // Do not require a Babel configuration file
    requireConfigFile: false,
    // Specify options for Babel parser
    babelOptions: {
      parserOpts: {
        // Enable parsing JSX syntax
        plugins: ['jsx'],
      },
    },
  },
  // Extend the airbnb ESLint configuration
  extends: ['airbnb'],
  // Specify environments for ESLint
  env: {
    // Enable browser environment
    browser: true,
    // Enable Jest environment
    jest: true,
  },
  // Specify ESLint plugins
  plugins: ['react', 'jsx-a11y', 'import'],
  // Specify ESLint rules
  rules: {
    // Turn off camelcase rule
    camelcase: 'off',
    // Allow underscore dangle for _id
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    // Turn off no-mixed-operators rule
    'no-mixed-operators': 'off'
