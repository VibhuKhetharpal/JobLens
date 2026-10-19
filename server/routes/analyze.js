import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import Listing from '../models/Listing.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5001';

// ─── POST /api/analyze ────────────────────────────────────────────────────────
// Accepts PDF upload, fetches live jobs from MongoDB, proxies to Flask
router.post('/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No resume file uploaded' });
  }

  try {
    // Aggregate distinct job roles from MongoDB with their skill tags and descriptions
    const jobDocs = await Listing.aggregate([
      {
        $match: {
          source: { $ne: 'arbeitnow' }
        }
      },
      {
        $group: {
          _id: { title: '$title', company: '$company' },
          city: { $first: '$city' },
          tags: { $first: '$tags' },
          description: { $first: '$description' },
          applyUrl: { $first: '$applyUrl' },
          salaryLpa: { $first: '$salaryLpa' }
        }
      },
      { $limit: 35 }
    ]);

    const jobs = jobDocs.map(j => ({
      title: j._id.title,
      company: j._id.company,
      city: j.city || '',
      tags: j.tags || [],
      description: j.description || '',
      applyUrl: j.applyUrl || '',
      salaryLpa: j.salaryLpa || ''
    }));

    if (jobs.length === 0) {
      return res.status(503).json({ error: 'No job listings in database. Run a sync first.' });
    }

    // Forward PDF + jobs JSON to Flask microservice
    const form = new FormData();
    form.append('resume', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    form.append('jobs', JSON.stringify(jobs));

    const flaskRes = await axios.post(`${FLASK_URL}/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 60000 // Gemini can take a while
    });

    return res.json(flaskRes.data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Resume analyzer service is not running. Start it with: python server/python/app.py'
      });
    }
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    console.error('[/api/analyze error]', message);
    return res.status(status).json({ error: message });
  }
});

// ─── POST /api/roadmap ────────────────────────────────────────────────────────
// Proxies roadmap generation request to Flask
router.post('/roadmap', express.json(), async (req, res) => {
  const { jobTitle, matched, missing } = req.body || {};

  if (!jobTitle || !Array.isArray(missing) || missing.length === 0) {
    return res.status(400).json({ error: 'jobTitle and missing skills array are required' });
  }

  try {
    const flaskRes = await axios.post(
      `${FLASK_URL}/roadmap`,
      { jobTitle, matched: matched || [], missing },
      { timeout: 45000 }
    );
    return res.json(flaskRes.data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Resume analyzer service is not running. Start it with: python server/python/app.py'
      });
    }
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    console.error('[/api/roadmap error]', message);
    return res.status(status).json({ error: message });
  }
});

export default router;
