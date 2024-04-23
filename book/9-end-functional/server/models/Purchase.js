/* eslint-disable linebreak-style */
// Disables eslint rule for line break style

const mongoose = require('mongoose');

// Destructure Schema from mongoose
const { Schema } = mongoose;

// MongoDB Schema definition
const mongoSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  // Structure for storing Stripe charge details
  stripeCharge: {
    id: String,
    amount: Number,
    created: Number,
    livemode: Boolean,
    paid: Boolean,
    status: String,
  },
});

// Indexing for MongoDB Schema
mongoSchema.index({ bookId: 1, userId: 1 }, { unique: true });

// Create Purchase model
const Purchase = mongoose.model('Purchase', mongoSchema);

// Export Purchase model
module.exports = Purchase;
