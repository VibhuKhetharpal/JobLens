import axios from 'axios';
import Listing from '../models/Listing.js';
import { EventEmitter } from 'events';

export const pipelineEvents = new EventEmitter();

async function ingestListings() {
  pipelineEvents.emit('ingestion:started');

  const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');
  const jobs = response.data.data;

  for (const job of jobs) {
    await Listing.findOneAndUpdate(
      { externalId: job.slug },
      {
        title: job.title,
        company: job.company_name,
        location: job.location,
        tags: job.tags,
        remote: job.remote,
        postedDate: new Date(job.created_at * 1000),
        source: 'arbeitnow',
        externalId: job.slug
      },
      { upsert: true, new: true }
    );
  }

  pipelineEvents.emit('ingestion:completed', { count: jobs.length });
  console.log(`Ingested ${jobs.length} listings`);
}

export default ingestListings;