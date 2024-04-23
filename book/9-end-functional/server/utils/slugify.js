/* eslint-disable linebreak-style */

// Import lodash library
const _ = require('lodash');

// Function to convert text into a kebab-case slug
const slugify = (text) => _.kebabCase(text);

// Recursive function to create a unique slug by appending a count to the original slug
async function createUniqueSlug(Model, slug, count) {
  // Check if a document with the slug exists in the database
  const user = await Model.findOne({ slug: `${slug}-${count}` }, 'id');

  // If no document exists with the slug, return the slug with the count appended
  if (!user) {
    return `${slug}-${count}`;
  }

  // If a document exists, recursively call the function with an incremented count
  return createUniqueSlug(Model, slug, count + 1);
}

// Function to generate a unique slug for a given Model, name, and optional filter
async function generateSlug(Model, name, filter = {}) {
  // Generate the original slug from the name
  const origSlug = slugify(name);

  // Check if a document with the original slug exists in the database
  const user = await Model.findOne({ slug: origSlug, ...filter }, 'id');

  // If no document exists with the original slug, return it as the unique slug
  if (!user) {
    return origSlug;
  }

  // If a document exists, call createUniqueSlug to generate a unique slug
  return createUniqueSlug(Model, origSlug, 1);
}

// Export the generateSlug function
module.exports = generateSlug;
