import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import listingsRoutes from './routes/listings.js';
console.log("===== MY SERVER.JS IS RUNNING =====");

const app = express();
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', listingsRoutes);

app.get('/', (req, res) => res.send('JobLens API running'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));