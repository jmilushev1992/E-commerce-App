/* eslint-disable linebreak-style */

// Disable eslint rule for using variables before they are defined
/* eslint-disable no-use-before-define */

const mongoose = require('mongoose');
const frontmatter = require('front-matter');

// Import utility functions and models
const generateSlug = require('../utils/slugify');
const User = require('./User');
const Purchase = require('./Purchase');
const { getCommits, getRepoDetail } = require('../github');
const { addToMailchimp } = require('../mailchimp');
const logger = require('../logger');
const Chapter = require('./Chapter');

// Define mongoose schema
const { Schema } = mongoose;
const mongoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  githubRepo: {
    type: String,
    required: true,
  },
  githubLastCommitSha: String,
  createdAt: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

// Define class methods for Book model
class BookClass {
  static async list({ offset = 0, limit = 10 } = {}) {
    const books = await this.find({}).sort({ createdAt: -1 }).skip(offset).limit(limit);
    return books;
  }

  static async getBySlug({ slug }) {
    // Retrieve book by slug and populate chapters
    const bookDoc = await this.findOne({ slug });
    if (!bookDoc) {
      throw new Error('Book not found');
    }

    const book = bookDoc.toObject();
    book.chapters = (await Chapter.find({ bookId: book._id }, 'title slug').sort({ order: 1 }))
      .map((chapter) => chapter.toObject());

    return book;
  }

  static async add({ name, price, githubRepo }) {
    // Add a new book with a unique slug
    const slug = await generateSlug(this, name);
    if (!slug) {
      throw new Error(`Error with slug generation for name: ${name}`);
    }
    return this.create({
      name,
      slug,
      price,
      githubRepo,
      createdAt: new Date(),
    });
  }

  static async edit({ id, name, price, githubRepo }) {
    // Edit an existing book
    const book = await this.findById(id, 'slug name');
    if (!book) {
      throw new Error('Book is not found by id');
    }

    const modifier = { price, githubRepo };

    if (name !== book.name) {
      modifier.name = name;
      modifier.slug = await generateSlug(this, name);
    }

    const editedBook = await this.findOneAndUpdate(
      { _id: id },
      { $set: modifier },
      { fields: 'slug', new: true },
    );

    return editedBook;
  }

  static async syncContent({ id, user, request }) {
    // Sync content of book from GitHub repository
    const book = await this.findById(id, 'githubRepo githubLastCommitSha');
    if (!book) {
      throw new Error('Book not found');
    }

    const repoCommits = await getCommits({
      user,
      repoName: book.githubRepo,
      request,
    });

    if (!repoCommits || !repoCommits.data || !repoCommits.data[0]) {
      throw new Error('No commits!');
    }

    const lastCommitSha = repoCommits.data[0].sha;
    if (lastCommitSha === book.githubLastCommitSha) {
      throw new Error('No change in content!');
    }

    const mainFolder = await getRepoDetail({
      user,
      repoName: book.githubRepo,
      request,
      path: '',
    });

    await Promise.all(mainFolder.data.map(async (f) => {
      if (f.type !== 'file') {
        return;
      }

      if (f.path !== 'introduction.md' && !/chapter-([0-9]+)\.md/.test(f.path)) {
        return;
      }

      const chapter = await getRepoDetail({
        user,
        repoName: book.githubRepo,
        request,
        path: f.path,
      });

      const data = frontmatter(Buffer.from(chapter.data.content, 'base64').toString('utf8'));
      data.path = f.path;

      try {
        await Chapter.syncContent({ book, data });
        logger.info('Content is synced', { path: f.path });
      } catch (error) {
        logger.error('Content sync has error', { path: f.path, error });
      }
    }));

    return book.updateOne({ githubLastCommitSha: lastCommitSha });
  }

  static async buy({ book, user, stripeCharge }) {
    // Purchase a book
    if (!book) {
      throw new Error('Book not found');
    }

    if (!user) {
      throw new Error('User required');
    }

    const isPurchased =
      (await Purchase.find({ userId: user._id, bookId: book._id }).countDocuments()) > 0;
    if (isPurchased) {
      throw new Error('You already bought this book.');
    }

    User.findByIdAndUpdate(user._id, { $addToSet: { purchasedBookIds: book._id } }).exec();

    try {
      await addToMailchimp({ email: user.email, listName: 'purchased' });
    } catch (error) {
      logger.error('Buy book error:', error);
    }

    return Purchase.create({
      userId: user._id,
      bookId: book._id,
      amount: book.price * 100,
      createdAt: new Date(),
      stripeCharge,
    });
  }

  static async getPurchasedBooks({ purchasedBookIds }) {
    // Get purchased books based on their IDs
    const purchasedBooks = await this.find({ _id: { $in: purchasedBookIds } }).sort({ createdAt: -1 });
    return purchasedBooks;
  }
}

// Load BookClass as a schema class
mongoSchema.loadClass(BookClass);

// Create Book model
const Book = mongoose.model('Book', mongoSchema);

module.exports = Book;

// Require Chapter model
const Chapter = require('./Chapter');
