import { useEffect, useState } from 'react';
import axios from 'axios';

function Listings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings').then(res => setListings(res.data));
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-200 mb-4">Listings</h2>
      <div className="divide-y divide-gray-800">
        {listings.map(job => (
          <div key={job._id} className="py-3">
            <div className="text-gray-100 font-medium">{job.title}</div>
            <div className="text-gray-400 text-sm">{job.company} — {job.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Listings;