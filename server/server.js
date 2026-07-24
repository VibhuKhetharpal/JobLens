import 'dotenv/config';
import cluster from 'cluster';
import os from 'os';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cron from 'node-cron';
import listingsRoutes from './routes/listings.js';
import ingestListings, { pipelineEvents } from './services/ingest.js';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary process ${process.pid} running — forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died — forking a replacement`);
    cluster.fork();
  });

} else {
  const app = express();
  app.use(cors());
  app.use(express.json());

  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(`Worker ${process.pid}: MongoDB connected`))
    .catch(err => console.error('MongoDB connection error:', err));

  app.use('/api', listingsRoutes);
  app.get('/', (req, res) => res.send('JobLens API running'));

  pipelineEvents.on('ingestion:started', () => console.log('[Event] Ingestion started'));
  pipelineEvents.on('ingestion:completed', (data) => console.log(`[Event] Ingestion completed — ${data.count} listings processed`));

  if (cluster.worker.id === 1) {
    cron.schedule('0 */6 * * *', () => {
      console.log('Running scheduled ingestion...');
      ingestListings();
    });
  }

  const PORT = 5000;
  app.listen(PORT, () => console.log(`Worker ${process.pid} running on port ${PORT}`));
}