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
router.get('/trends/locations', async (req, res) => {
  const locations = await Listing.aggregate([
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  res.json(locations);
});
router.get('/trends/remote-split', async (req, res) => {
  const split = await Listing.aggregate([
    { $group: { _id: '$remote', count: { $sum: 1 } } }
  ]);
  res.json(split);
});

router.get('/trends/skills', async (req, res) => {
  const trends = await Listing.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  res.json(trends);
});

export default router;