import express from 'express';
import Listing from '../models/Listing.js';
import ingestListings from '../services/ingest.js';

const router = express.Router();

// GET /api/listings with optional search, city, tag, and remote filters
router.get('/listings', async (req, res) => {
  try {
    const { search, city, tag, remote, limit = 50, page = 1 } = req.query;
    const filter = { source: { $ne: 'arbeitnow' } };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (city && city !== 'All') {
      filter.city = city;
    }

    if (remote === 'true') {
      filter.remote = true;
    }

    if (tag) {
      filter.tags = tag;
    }

    const pageSize = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * pageSize;

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort({ postedDate: -1 }).skip(skip).limit(pageSize),
      Listing.countDocuments(filter)
    ]);

    res.json({ listings, total, page: parseInt(page) || 1, pageSize });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger ingestion manually
router.get('/ingest', async (req, res) => {
  try {
    const result = await ingestListings();
    res.json({ status: 'done', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top Indian Tech Hubs (Cities)
router.get('/trends/locations', async (req, res) => {
  try {
    const locations = await Listing.aggregate([
      { $match: { city: { $ne: null } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remote vs Onsite distribution
router.get('/trends/remote-split', async (req, res) => {
  try {
    const split = await Listing.aggregate([
      { $group: { _id: '$remote', count: { $sum: 1 } } }
    ]);
    res.json(split);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top Hiring Companies (single route, no duplicate)
router.get('/trends/companies', async (req, res) => {
  try {
    const companies = await Listing.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top Skills in demand
router.get('/trends/skills', async (req, res) => {
  try {
    const trends = await Listing.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Salary benchmark trends in INR LPA by city
router.get('/trends/salaries', async (req, res) => {
  try {
    const salaryByCity = await Listing.aggregate([
      {
        $match: {
          salaryMin: { $ne: null, $gt: 0 },
          city: { $nin: ['India', null] }
        }
      },
      {
        $group: {
          _id: '$city',
          avgMin: { $avg: '$salaryMin' },
          avgMax: { $avg: '$salaryMax' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          city: '$_id',
          avgLpa: {
            $round: [
              {
                $divide: [
                  { $avg: ['$avgMin', { $ifNull: ['$avgMax', '$avgMin'] }] },
                  100000
                ]
              },
              1
            ]
          },
          count: 1
        }
      },
      { $sort: { avgLpa: -1 } },
      { $limit: 8 }
    ]);
    res.json(salaryByCity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Frequently paired tech skills co-occurrence
router.get('/trends/skill-pairs', async (req, res) => {
  try {
    const pairs = await Listing.aggregate([
      { $match: { 'tags.1': { $exists: true } } },
      { $project: { tags: 1 } },
      { $unwind: '$tags' },
      {
        $lookup: {
          from: 'listings',
          let: { currentId: '$_id', currentTag: '$tags' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$currentId'] } } },
            { $unwind: '$tags' },
            { $match: { $expr: { $gt: ['$tags', '$$currentTag'] } } },
            { $project: { pairedTag: '$tags', _id: 0 } }
          ],
          as: 'pairs'
        }
      },
      { $unwind: '$pairs' },
      {
        $group: {
          _id: { $concat: ['$tags', ' + ', '$pairs.pairedTag'] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    res.json(pairs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;