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
router.get('/trends/companies', async (req, res) => {
  const companies = await Listing.aggregate([
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  res.json(companies);
});
router.get('/trends/skill-pairs', async (req, res) => {
  const pairs = await Listing.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$_id', tags: { $push: '$tags' } } },
    { $project: {
        pairs: {
          $filter: {
            input: { $reduce: {
              input: '$tags',
              initialValue: [],
              in: { $concatArrays: ['$$value', { $map: {
                input: '$tags',
                as: 't',
                in: { $concatArrays: [['$$this'], ['$$t']] }
              }}]}
            }},
            cond: { $ne: [{ $arrayElemAt: ['$$this', 0] }, { $arrayElemAt: ['$$this', 1] }] }
          }
        }
    }}
  ]);
  res.json(pairs);
});
router.get('/trends/companies', async (req, res) => {
  const companies = await Listing.aggregate([
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  res.json(companies);
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