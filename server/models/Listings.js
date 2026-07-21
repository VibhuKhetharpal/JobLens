const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  tags: [String],
  remote: Boolean,
  postedDate: Date,
  source: String,
  externalId: { type: String, unique: true }
});

module.exports = mongoose.model('Listing', listingSchema);