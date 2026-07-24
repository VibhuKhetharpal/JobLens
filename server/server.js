import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cron from 'node-cron';
import listingsRoutes from './routes/listings.js';
import ingestListings from './services/ingest.js';
import { pipelineEvents } from './services/ingest.js';

pipelineEvents.on('ingestion:started', () => console.log('[Event] Ingestion started'));
pipelineEvents.on('ingestion:completed', (data) => console.log(`[Event] Ingestion completed — ${data.count} listings processed`));

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', listingsRoutes);

app.get('/', (req, res) => res.send('JobLens API running'));

// Run ingestion every 6 hours automatically
cron.schedule('0 */6 * * *', () => {
  console.log('Running scheduled ingestion...');
  ingestListings();
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));