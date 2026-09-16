import axios from 'axios';
import Listing from '../models/Listing.js';
import { EventEmitter } from 'events';

export const pipelineEvents = new EventEmitter();

// Common tech keywords to extract from job title and description
const TECH_KEYWORDS = [
  'React', 'Next.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Tailwind',
  'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
  'Go', 'Golang', 'Rust', 'C++', 'C#', '.NET', 'PHP',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Kafka', 'Elasticsearch', 'GraphQL',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'AI', 'GenAI', 'LLM'
];

function extractSkills(text = '') {
  if (!text) return [];
  const found = new Set();
  const lower = text.toLowerCase();

  for (const skill of TECH_KEYWORDS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) {
      found.add(skill);
    }
  }

  // Common aliases
  if (/\b(js|es6)\b/i.test(lower) && !found.has('JavaScript')) found.add('JavaScript');
  if (/\bts\b/i.test(lower) && !found.has('TypeScript')) found.add('TypeScript');
  if (/\b(k8s)\b/i.test(lower) && !found.has('Kubernetes')) found.add('Kubernetes');

  return Array.from(found).slice(0, 7);
}

function normalizeCity(rawLocation = '', isRemote = false) {
  if (isRemote) return 'Remote';
  const loc = rawLocation.toLowerCase();

  // Direct remote checks
  if (loc.includes('remote') || loc.includes('work from home') || loc.includes('wfh')) return 'Remote';

  // Major tech cities
  if (loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('karnataka')) return 'Bengaluru';
  if (loc.includes('hyderabad') || loc.includes('secunderabad') || loc.includes('telangana') || loc.includes('andhra')) return 'Hyderabad';
  if (loc.includes('pune')) return 'Pune';
  if (loc.includes('mumbai') || loc.includes('navi mumbai') || loc.includes('thane')) return 'Mumbai';
  if (
    loc.includes('gurgaon') || loc.includes('gurugram') || loc.includes('noida') ||
    loc.includes('delhi') || loc.includes('ghaziabad') || loc.includes('faridabad') ||
    loc.includes('haryana') || loc.includes('uttar pradesh') || loc.includes('ncr')
  ) return 'Delhi-NCR';
  if (loc.includes('chennai') || loc.includes('tamil nadu')) return 'Chennai';
  if (loc.includes('kolkata') || loc.includes('west bengal')) return 'Kolkata';
  if (loc.includes('ahmedabad') || loc.includes('gujarat')) return 'Ahmedabad';
  if (loc.includes('kochi') || loc.includes('cochin') || loc.includes('trivandrum') || loc.includes('kerala')) return 'Kochi';
  if (loc.includes('chandigarh') || loc.includes('punjab')) return 'Chandigarh';
  if (loc.includes('jaipur') || loc.includes('rajasthan')) return 'Jaipur';
  if (loc.includes('maharashtra')) return 'Pune';

  return 'India';
}


function formatLpa(min, max) {
  if (!min && !max) return null;
  const toLakhs = (val) => (val / 100000).toFixed(1).replace(/\.0$/, '');
  if (min && max) {
    return `₹${toLakhs(min)} - ${toLakhs(max)} LPA`;
  }
  return `₹${toLakhs(min || max)} LPA`;
}

// Curated seed data for Indian tech roles when Adzuna API keys are not yet configured
const SEED_INDIAN_LISTINGS = [
  {
    title: 'Senior Frontend Engineer (React / Next.js)',
    company: 'Razorpay',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'GraphQL'],
    remote: false,
    salaryMin: 2200000,
    salaryMax: 3500000,
    salaryLpa: '₹22 - 35 LPA',
    currency: 'INR',
    applyUrl: 'https://razorpay.com/jobs',
    description: 'Lead high-scale merchant checkout web experiences using React, Next.js and TypeScript.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 4),
    source: 'seed',
    externalId: 'rzp-fe-sr-01'
  },
  {
    title: 'Backend Engineer - Payments Infrastructure',
    company: 'PhonePe',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    tags: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'SQL'],
    remote: false,
    salaryMin: 2400000,
    salaryMax: 3800000,
    salaryLpa: '₹24 - 38 LPA',
    currency: 'INR',
    applyUrl: 'https://phonepe.com/careers',
    description: 'Design distributed transaction processing engines handling millions of transactions per minute.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
    source: 'seed',
    externalId: 'phonepe-be-02'
  },
  {
    title: 'Full Stack Engineer (Node.js + React)',
    company: 'Swiggy',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    tags: ['Node.js', 'React', 'PostgreSQL', 'AWS', 'Docker'],
    remote: false,
    salaryMin: 1800000,
    salaryMax: 2800000,
    salaryLpa: '₹18 - 28 LPA',
    currency: 'INR',
    applyUrl: 'https://swiggy.com/careers',
    description: 'Work across consumer facing ordering and delivery tracking systems with low latency.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
    source: 'seed',
    externalId: 'swiggy-fs-03'
  },
  {
    title: 'Staff Platform Engineer - Kubernetes & Cloud',
    company: 'CRED',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    tags: ['Kubernetes', 'Docker', 'Go', 'AWS', 'Terraform'],
    remote: false,
    salaryMin: 4000000,
    salaryMax: 6000000,
    salaryLpa: '₹40 - 60 LPA',
    currency: 'INR',
    applyUrl: 'https://cred.club/careers',
    description: 'Build enterprise-scale internal developer platform and multi-region Kubernetes clusters.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 16),
    source: 'seed',
    externalId: 'cred-platform-04'
  },
  {
    title: 'Machine Learning Engineer - Recommendation Engine',
    company: 'Zomato',
    location: 'Gurugram, Haryana',
    city: 'Delhi-NCR',
    tags: ['Python', 'PyTorch', 'Machine Learning', 'TensorFlow', 'SQL'],
    remote: false,
    salaryMin: 2500000,
    salaryMax: 4000000,
    salaryLpa: '₹25 - 40 LPA',
    currency: 'INR',
    applyUrl: 'https://zomato.com/careers',
    description: 'Deploy real-time ranking and candidate recommendation models for food delivery feed.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 20),
    source: 'seed',
    externalId: 'zomato-mle-05'
  },
  {
    title: 'Senior Software Engineer (Go / Microservices)',
    company: 'Zepto',
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    tags: ['Go', 'Kafka', 'Redis', 'PostgreSQL', 'Docker'],
    remote: false,
    salaryMin: 2200000,
    salaryMax: 3400000,
    salaryLpa: '₹22 - 34 LPA',
    currency: 'INR',
    applyUrl: 'https://zeptonow.com/careers',
    description: 'Build hyper-fast order dispatching and inventory indexing engines.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    source: 'seed',
    externalId: 'zepto-go-06'
  },
  {
    title: 'Lead Frontend Developer',
    company: 'Paytm',
    location: 'Noida, Uttar Pradesh',
    city: 'Delhi-NCR',
    tags: ['React', 'TypeScript', 'Redux', 'JavaScript', 'CSS'],
    remote: false,
    salaryMin: 2000000,
    salaryMax: 3000000,
    salaryLpa: '₹20 - 30 LPA',
    currency: 'INR',
    applyUrl: 'https://paytm.com/careers',
    description: 'Architect web banking dashboards and merchant analytics portals.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 28),
    source: 'seed',
    externalId: 'paytm-fe-07'
  },
  {
    title: 'DevOps / SRE Specialist',
    company: 'Infosys',
    location: 'Pune, Maharashtra',
    city: 'Pune',
    tags: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Linux'],
    remote: false,
    salaryMin: 1200000,
    salaryMax: 1800000,
    salaryLpa: '₹12 - 18 LPA',
    currency: 'INR',
    applyUrl: 'https://infosys.com/careers',
    description: 'Manage automated cloud infrastructure, zero-downtime releases and observability stacks.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 32),
    source: 'seed',
    externalId: 'infy-devops-08'
  },
  {
    title: 'Cloud Solutions Architect (AWS / Azure)',
    company: 'TCS',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    tags: ['AWS', 'Azure', 'Python', 'Docker', 'Terraform'],
    remote: false,
    salaryMin: 1500000,
    salaryMax: 2400000,
    salaryLpa: '₹15 - 24 LPA',
    currency: 'INR',
    applyUrl: 'https://tcs.com/careers',
    description: 'Design enterprise cloud migrations and resilient multi-region architectures.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 36),
    source: 'seed',
    externalId: 'tcs-cloud-09'
  },
  {
    title: 'Senior Python / Django Backend Developer',
    company: 'Postman',
    location: 'Remote, India',
    city: 'Remote',
    tags: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker'],
    remote: true,
    salaryMin: 2800000,
    salaryMax: 4200000,
    salaryLpa: '₹28 - 42 LPA',
    currency: 'INR',
    applyUrl: 'https://postman.com/careers',
    description: 'Build backend developer tooling APIs and collaboration workflows.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 40),
    source: 'seed',
    externalId: 'postman-py-10'
  },
  {
    title: 'Data Engineer (Spark, Kafka, Big Data)',
    company: 'Flipkart',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    tags: ['Python', 'Kafka', 'SQL', 'AWS', 'Machine Learning'],
    remote: false,
    salaryMin: 2000000,
    salaryMax: 3200000,
    salaryLpa: '₹20 - 32 LPA',
    currency: 'INR',
    applyUrl: 'https://flipkart.com/careers',
    description: 'Architect petabyte-scale data pipelines for marketplace analytics and fraud detection.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 44),
    source: 'seed',
    externalId: 'fk-data-11'
  },
  {
    title: 'Senior React Native / Mobile Engineer',
    company: 'Meesho',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    tags: ['React', 'TypeScript', 'JavaScript', 'GraphQL'],
    remote: false,
    salaryMin: 2400000,
    salaryMax: 3600000,
    salaryLpa: '₹24 - 36 LPA',
    currency: 'INR',
    applyUrl: 'https://meesho.io/careers',
    description: 'Build high-performance mobile e-commerce apps for the next billion Indian shoppers.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
    source: 'seed',
    externalId: 'meesho-mobile-12'
  },
  {
    title: 'Senior Java Backend Engineer (Spring Cloud)',
    company: 'Wipro',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    tags: ['Java', 'Spring Boot', 'SQL', 'Kafka', 'Docker'],
    remote: false,
    salaryMin: 1400000,
    salaryMax: 2200000,
    salaryLpa: '₹14 - 22 LPA',
    currency: 'INR',
    applyUrl: 'https://wipro.com/careers',
    description: 'Develop scalable microservices for global banking and finance clients.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 52),
    source: 'seed',
    externalId: 'wipro-java-13'
  },
  {
    title: 'Full Stack Web Developer (Next.js & PostgreSQL)',
    company: 'Hasura',
    location: 'Remote, India',
    city: 'Remote',
    tags: ['React', 'Next.js', 'TypeScript', 'GraphQL', 'PostgreSQL'],
    remote: true,
    salaryMin: 2500000,
    salaryMax: 3800000,
    salaryLpa: '₹25 - 38 LPA',
    currency: 'INR',
    applyUrl: 'https://hasura.io/careers',
    description: 'Build developer consoles and cloud console dashboards for instant GraphQL backends.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 56),
    source: 'seed',
    externalId: 'hasura-fs-14'
  },
  {
    title: 'Software Development Engineer II (C++ & Distributed Systems)',
    company: 'Adobe India',
    location: 'Noida, Uttar Pradesh',
    city: 'Delhi-NCR',
    tags: ['C++', 'Python', 'AWS', 'Linux'],
    remote: false,
    salaryMin: 3000000,
    salaryMax: 4500000,
    salaryLpa: '₹30 - 45 LPA',
    currency: 'INR',
    applyUrl: 'https://adobe.com/careers',
    description: 'Develop high-performance rendering engines and cloud creative tools.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 60),
    source: 'seed',
    externalId: 'adobe-cpp-15'
  },
  {
    title: 'Senior Frontend Engineer (Design Systems)',
    company: 'Urban Company',
    location: 'Gurugram, Haryana',
    city: 'Delhi-NCR',
    tags: ['React', 'TypeScript', 'Tailwind', 'JavaScript'],
    remote: false,
    salaryMin: 2000000,
    salaryMax: 3200000,
    salaryLpa: '₹20 - 32 LPA',
    currency: 'INR',
    applyUrl: 'https://urbancompany.com/careers',
    description: 'Build the core design system components powering web and partner portals.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 64),
    source: 'seed',
    externalId: 'uc-fe-16'
  },
  {
    title: 'Backend Systems Engineer (Golang)',
    company: 'Groww',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    tags: ['Go', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'],
    remote: false,
    salaryMin: 2600000,
    salaryMax: 4000000,
    salaryLpa: '₹26 - 40 LPA',
    currency: 'INR',
    applyUrl: 'https://groww.in/careers',
    description: 'Engineered high-frequency order placement systems for stock and mutual fund investments.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 68),
    source: 'seed',
    externalId: 'groww-go-17'
  },
  {
    title: 'QA Automation Engineer (Cypress / Playwright)',
    company: 'HCL Technologies',
    location: 'Chennai, Tamil Nadu',
    city: 'Chennai',
    tags: ['JavaScript', 'TypeScript', 'Python', 'CI/CD'],
    remote: false,
    salaryMin: 1000000,
    salaryMax: 1600000,
    salaryLpa: '₹10 - 16 LPA',
    currency: 'INR',
    applyUrl: 'https://hcltech.com/careers',
    description: 'Create end-to-end automated testing suites for enterprise web and mobile applications.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 72),
    source: 'seed',
    externalId: 'hcl-qa-18'
  },
  {
    title: 'Senior AI Engineer (LLMs & RAG)',
    company: 'Fractal Analytics',
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    tags: ['Python', 'AI', 'GenAI', 'LLM', 'PyTorch', 'AWS'],
    remote: false,
    salaryMin: 2800000,
    salaryMax: 4200000,
    salaryLpa: '₹28 - 42 LPA',
    currency: 'INR',
    applyUrl: 'https://fractal.ai/careers',
    description: 'Develop enterprise generative AI agents, vector retrieval pipelines, and fine-tuned models.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 76),
    source: 'seed',
    externalId: 'fractal-ai-19'
  },
  {
    title: 'Senior Cloud Security Engineer',
    company: 'Cognizant',
    location: 'Pune, Maharashtra',
    city: 'Pune',
    tags: ['AWS', 'Azure', 'Kubernetes', 'Linux', 'Python'],
    remote: false,
    salaryMin: 1600000,
    salaryMax: 2500000,
    salaryLpa: '₹16 - 25 LPA',
    currency: 'INR',
    applyUrl: 'https://cognizant.com/careers',
    description: 'Implement cloud security posture management, IAM policies, and automated compliance guards.',
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 80),
    source: 'seed',
    externalId: 'cts-sec-20'
  }
];

const ROLE_QUERIES = [
  'software developer',
  'frontend developer',
  'backend developer',
  'full stack developer',
  'devops engineer',
  'data scientist'
];

async function ingestFromAdzuna(appId, appKey) {
  const allRawJobs = [];
  const seenIds = new Set();

  for (const role of ROLE_QUERIES) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=25&what=${encodeURIComponent(role)}&content-type=application/json`;
      const response = await axios.get(url, { timeout: 10000 });
      const results = response.data?.results || [];

      for (const job of results) {
        if (!seenIds.has(job.id)) {
          seenIds.add(job.id);
          allRawJobs.push(job);
        }
      }
    } catch (err) {
      console.warn(`[Adzuna] Query failed for role "${role}":`, err.message);
    }
  }

  return allRawJobs.map(job => {
    const isRemote = /remote|work from home|wfh/i.test((job.title || '') + ' ' + (job.description || '') + ' ' + (job.location?.display_name || ''));
    const city = normalizeCity(job.location?.display_name || '', isRemote);
    const tags = extractSkills((job.title || '') + ' ' + (job.description || ''));

    const minSalary = job.salary_min || null;
    const maxSalary = job.salary_max || null;

    return {
      title: (job.title || '').replace(/<[^>]*>?/gm, ''),
      company: job.company?.display_name || 'Confidential',
      location: job.location?.display_name || (isRemote ? 'Remote, India' : 'India'),
      city: city,
      tags: tags.length > 0 ? tags : ['Software Engineering', 'IT Jobs'],
      remote: isRemote,
      salaryMin: minSalary,
      salaryMax: maxSalary,
      salaryLpa: formatLpa(minSalary, maxSalary),
      currency: 'INR',
      applyUrl: job.redirect_url,
      description: (job.description || '').replace(/<[^>]*>?/gm, ''),
      postedDate: job.created ? new Date(job.created) : new Date(),
      source: 'adzuna',
      externalId: `adzuna-${job.id}`
    };
  });
}

async function ingestListings() {
  pipelineEvents.emit('ingestion:started');

  // 1. Purge legacy German listings
  try {
    const deletedLegacy = await Listing.deleteMany({ source: 'arbeitnow' });
    if (deletedLegacy.deletedCount > 0) {
      console.log(`[Ingest] Purged ${deletedLegacy.deletedCount} legacy German listings.`);
    }
  } catch (err) {
    console.warn('[Ingest] Cleanup legacy listings notice:', err.message);
  }

  // 2. TTL Cleanup: Remove postings older than 45 days
  try {
    const STALE_DAYS = 45;
    const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);
    const deletedStale = await Listing.deleteMany({ postedDate: { $lt: staleThreshold } });
    if (deletedStale.deletedCount > 0) {
      console.log(`[Ingest] Purged ${deletedStale.deletedCount} stale jobs older than ${STALE_DAYS} days.`);
    }
  } catch (err) {
    console.warn('[Ingest] Stale cleanup notice:', err.message);
  }

  let jobsToIngest = [];
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (appId && appKey) {
    try {
      console.log('Fetching live Indian tech jobs across multiple roles from Adzuna API...');
      jobsToIngest = await ingestFromAdzuna(appId, appKey);
      console.log(`Fetched ${jobsToIngest.length} distinct jobs from Adzuna India`);
    } catch (err) {
      console.warn(`Adzuna API call failed (${err.message}). Falling back to curated Indian tech seed data.`);
      jobsToIngest = SEED_INDIAN_LISTINGS;
    }
  } else {
    console.log('No ADZUNA_APP_ID or ADZUNA_APP_KEY configured in .env. Ingesting curated Indian tech seed data.');
    jobsToIngest = SEED_INDIAN_LISTINGS;
  }

  if (jobsToIngest.length === 0) {
    jobsToIngest = SEED_INDIAN_LISTINGS;
  }

  // Use bulkWrite for high performance atomic batch upsert
  const bulkOps = jobsToIngest.map(job => ({
    updateOne: {
      filter: { externalId: job.externalId },
      update: { $set: job },
      upsert: true
    }
  }));

  const result = await Listing.bulkWrite(bulkOps, { ordered: false });
  const totalCount = (result.upsertedCount || 0) + (result.modifiedCount || 0);

  pipelineEvents.emit('ingestion:completed', { count: totalCount });
  console.log(`[Ingest] Completed: ${totalCount} Indian listings updated/upserted in DB.`);
  return { count: totalCount, source: appId && appKey ? 'adzuna' : 'seed' };
}

export default ingestListings;