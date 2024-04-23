/* eslint-disable linebreak-style */

// Import the generateSlug function from the specified path
const generateSlug = require('../../../server/utils/slugify');

// Mock User object with predefined slugs and findOne method
const MockUser = {
  slugs: ['john-jonhson-jr', 'john-jonhson-jr-1', 'john'],
  findOne({ slug }) {
    // Check if the provided slug exists in the predefined slugs array
    if (this.slugs.includes(slug)) {
      // If the slug exists, return a Promise resolving to an object with an 'id' property
      return Promise.resolve({ id: 'id' });
    }

    // If the slug does not exist, return a Promise resolving to null
    return Promise.resolve(null);
  },
};

// Describe block for the slugify function tests
describe('slugify', () => {
  // Test case for no duplication scenario
  test('no duplication', () => {
    // Assert that there is one expectation
    expect.assertions(1);

    // Call the generateSlug function with a name and check the generated slug
    return generateSlug(MockUser, 'John Jonhson.').then((slug) => {
      // Expect the generated slug to be 'john-jonhson'
      expect(slug).toBe('john-jonhson');
    });
  });

  // Test case for one duplication scenario
  test('one duplication', () => {
    // Assert that there is one expectation
    expect.assertions(1);

    // Call the generateSlug function with a name and check the generated slug
    return generateSlug(MockUser, 'John.').then((slug) => {
      // Expect the generated slug to be 'john-1'
      expect(slug).toBe('john-1');
    });
  });

  // Test case for multiple duplications scenario
  test('multiple duplications', () => {
    // Assert that there is one expectation
    expect.assertions(1);

    // Call the generateSlug function with a name and check the generated slug
    return generateSlug(MockUser, 'John Jonhson Jr.').then((slug) => {
      // Expect the generated slug to be 'john-jonhson-jr-2'
      expect(slug).toBe('john-jonhson-jr-2');
    });
  });
});
