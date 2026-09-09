import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  city: { type: String, index: true },
  tags: { type: [String], index: true },
  remote: { type: Boolean, default: false, index: true },
  salaryMin: Number,
  salaryMax: Number,
  salaryLpa: String,
  currency: { type: String, default: 'INR' },
  applyUrl: String,
  description: String,
  postedDate: { type: Date, default: Date.now, index: true },
  source: { type: String, default: 'adzuna' },
  externalId: { type: String, unique: true, required: true }
});

listingSchema.index({ postedDate: -1 });
listingSchema.index({ city: 1, postedDate: -1 });

export default mongoose.model('Listing', listingSchema);