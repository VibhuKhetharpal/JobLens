import 'dotenv/config';
import cluster from 'cluster';
import os from 'os';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import listingsRoutes from './routes/listings.js';
import ingestListings, { pipelineEvents } from './services/ingest.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/JobLens';
const ENABLE_CLUSTER = process.env.CLUSTER === 'true';

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// Stricter limiter for ingest triggers to preserve external API quota
const ingestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Ingestion rate limit reached. Please wait before syncing again.' }
});

// Pipeline logging listeners
pipelineEvents.on('ingestion:started', () => console.log('[Event] Ingestion started'));
pipelineEvents.on('ingestion:completed', (data) => console.log(`[Event] Ingestion completed — ${data.count} listings processed`));

function setupMiddleware(app) {
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  app.use('/api/ingest', ingestLimiter);
  app.use('/api', apiLimiter);
}

function startWorkerServer() {
  const app = express();
  setupMiddleware(app);

  mongoose.connect(MONGO_URI)
    .then(() => console.log(`[Server] Worker ${process.pid}: MongoDB connected`))
    .catch(err => console.error(`[Server] Worker ${process.pid}: MongoDB connection error:`, err));

  app.use('/api', listingsRoutes);
  app.get('/', (req, res) => res.send('JobLens India API running'));

  app.listen(PORT, () => console.log(`[Server] Worker ${process.pid} listening on port ${PORT}`));
}


if (ENABLE_CLUSTER && cluster.isPrimary) {
  const numCPUs = Math.min(os.cpus().length, 4); // Limit to reasonable worker count
  console.log(`[Cluster] Primary ${process.pid} running — forking ${numCPUs} workers`);

  // Connect Mongo in primary to run background cron reliably
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log('[Cluster] Primary: MongoDB connected for scheduler');
      // Run initial ingestion check
      await ingestListings().catch(e => console.error('Initial ingestion failed:', e.message));
    })
    .catch(err => console.error('[Cluster] Primary: Mongo connection error:', err));

  // The cron schedule runs in primary, so it NEVER dies when a worker exits
  cron.schedule('0 */6 * * *', () => {
    console.log('[Cron] Running scheduled Indian job ingestion in Primary...');
    ingestListings().catch(e => console.error('[Cron] Ingestion error:', e.message));
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`[Cluster] Worker ${worker.process.pid} died — forking replacement`);
    cluster.fork();
  });

} else if (ENABLE_CLUSTER) {
  // Worker process in cluster mode
  startWorkerServer();
} else {
  // Single process mode (clean dev & standard deployments)
  const app = express();
  setupMiddleware(app);

  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log(`[Server] MongoDB connected on PID ${process.pid}`);
      // Run initial ingestion so DB has Indian tech listings immediately
      await ingestListings().catch(e => console.error('Initial ingestion failed:', e.message));
    })
    .catch(err => console.error('MongoDB connection error:', err));

  app.use('/api', listingsRoutes);
  app.get('/', (req, res) => res.send('JobLens India API running'));

  // Scheduled ingestion every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('[Cron] Running scheduled Indian job ingestion...');
    ingestListings().catch(e => console.error('[Cron] Ingestion error:', e.message));
  });

  app.listen(PORT, () => console.log(`[Server] JobLens API running on http://localhost:${PORT}`));
}