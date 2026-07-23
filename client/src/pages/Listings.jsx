import { useEffect, useState } from 'react';
import axios from 'axios';

function Listings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings').then(res => setListings(res.data));
  }, []);

  return (
    <div className="section">
      <h2>Listings</h2>
      {listings.map(job => (
        <div className="job-card" key={job._id}>
          <div className="job-title">{job.title}</div>
          <div className="job-meta">{job.company} — {job.location}</div>
        </div>
      ))}
    </div>
  );
}

export default Listings;