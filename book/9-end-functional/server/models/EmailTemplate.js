/* eslint-disable linebreak-style */
// Disables eslint rule for line break style

/* eslint-disable no-multiple-empty-lines */
// Disables eslint rule for multiple empty lines

const mongoose = require('mongoose');
const _ = require('lodash');

const { Schema } = mongoose;

// MongoDB Schema definition
const mongoSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

// EmailTemplate model creation
const EmailTemplate = mongoose.model('EmailTemplate', mongoSchema);

// Function to insert email templates
async function insertTemplates() {
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to builderbook.org',
      message: `<%= userName %>,
        <p>
          At Builder Book, we are excited to help you build useful, production-ready web apps from scratch.
        </p>
        <p>
          See list of available books here.
        </p>

        Kelly & Timur,
        Team BB
      `,
    },
  ];

  // Iterating through templates array
  for (const t of templates) { // eslint-disable-line
    const et = await EmailTemplate.findOne({ name: t.name }); // eslint-disable-line

    // Normalizing message (removing extra spaces and newlines)
    const message = t.message.replace(/\n/g, '').replace(/[ ]+/g, ' ').trim();

    // If template doesn't exist, create it
    if (!et) {
      EmailTemplate.create({ ...t, message });
    } 
    // If template exists but subject or message has changed, update it
    else if (et.subject !== t.subject || et.message !== message) {
      EmailTemplate.updateOne({ _id: et._id }, { $set: { message, subject: t.subject } }).exec();
    }
  }
}

// Function to get email template by name
async function getEmailTemplate(name, params) {
  const et = await EmailTemplate.findOne({ name });

  if (!et) {
    throw new Error(`No EmailTemplates found.`);
  }

  // Compile template with parameters
  return {
    message: _.template(et.message)(params),
    subject: _.template(et.subject)(params),
  };
}

// Exporting functions
exports.insertTemplates = insertTemplates;
exports.getEmailTemplate = getEmailTemplate;
