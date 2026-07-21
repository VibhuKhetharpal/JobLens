import mongoose from 'mongoose';

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

export default mongoose.model('Listing', listingSchema);