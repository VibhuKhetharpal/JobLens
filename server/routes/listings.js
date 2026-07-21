const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const ingestListings = require('../services/ingest');

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

module.exports = router;