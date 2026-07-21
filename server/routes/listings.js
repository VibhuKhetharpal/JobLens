import express from 'express';
import Listing from '../models/Listing.js';
import ingestListings from '../services/ingest.js';

const router = express.Router();

router.get('/listings', async (req, res) => {
  const listings = await Listing.find().sort({ postedDate: -1 }).limit(50);
  res.json(listings);
});

router.get('/ingest', async (req, res) => {
  try {
    await ingestListings();
    res.json({ status: 'done' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;