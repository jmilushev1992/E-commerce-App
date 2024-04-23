/* eslint-disable linebreak-style */
// Disables eslint rule for line break style

/* eslint-disable no-multiple-empty-lines */
// Disables eslint rule for multiple empty lines

const mongoose = require('mongoose');
const _ = require('lodash');

// Importing functions from other modules
const { addToMailchimp } = require('../mailchimp');
const generateSlug = require('../utils/slugify');
const sendEmail = require('../aws-ses');
const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logger');

// Destructure Schema from mongoose
const { Schema } = mongoose;

// MongoDB Schema definition
const mongoSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  googleToken: {
    access_token: String,
    refresh_token: String,
    token_type: String,
    expiry_date: Number,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  displayName: String,
  avatarUrl: String,

  isGithubConnected: {
    type: Boolean,
    default: false,
  },
  githubAccessToken: {
    type: String,
  },
  githubId: {
    type: String,
  },
  purchasedBookIds: [String],
});

// Class definition for User model
class UserClass {
  // Method to define public fields
  static publicFields() {
    return [
      'id',
      'displayName',
      'email',
      'avatarUrl',
      'slug',
      'isAdmin',
      'isGithubConnected',
      'purchasedBookIds',
    ];
  }

  // Method to sign in or sign up a user
  static async signInOrSignUp({ googleId, email, googleToken, displayName, avatarUrl }) {
    const user = await this.findOne({ googleId }).select(UserClass.publicFields().join(' '));

    if (user) {
      const modifier = {};

      if (googleToken.accessToken) {
        modifier.access_token = googleToken.accessToken;
      }

      if (googleToken.refreshToken) {
        modifier.refresh_token = googleToken.refreshToken;
      }

      if (_.isEmpty(modifier)) {
        return user;
      }

      await this.updateOne({ googleId }, { $set: modifier });

      return user;
    }

    // Generate slug for the new user
    const slug = await generateSlug(this, displayName);
    // Count the number of existing users
    const userCount = await this.find().countDocuments();

    // Create a new user
    const newUser = await this.create({
      createdAt: new Date(),
      googleId,
      email,
      googleToken,
      displayName,
      avatarUrl,
      slug,
      isAdmin: userCount === 0,
    });

    try {
      // Send welcome email to the new user
      const template = await getEmailTemplate('welcome', {
        userName: displayName,
      });

      await sendEmail({
        from: `Kelly from Builder Book <${process.env.EMAIL_ADDRESS_FROM}>`,
        to: [email],
        subject: template.subject,
        body: template.message,
      });
    } catch (err) {
      logger.debug('Email sending error:', err);
    }

    try {
      // Add the user to Mailchimp list
      await addToMailchimp({ email, listName: 'signedup' });
    } catch (error) {
      logger.error('Mailchimp error:', error);
    }

    // Return public fields of the new user
    return _.pick(newUser, UserClass.publicFields());
  }
}

// Load class methods into Schema
mongoSchema.loadClass(UserClass);

// Create User model
const User = mongoose.model('User', mongoSchema);

// Export User model
module.exports = User;
