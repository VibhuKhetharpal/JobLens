import { useEffect, useState } from 'react';
import axios from 'axios';

function Listings() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings').then(res => setListings(res.data));
  }, []);

  const filtered = listings.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by title or company..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />

      <div className="grid gap-3">
        {filtered.map(job => (
          <div key={job._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-gray-100 font-semibold">{job.title}</div>
                <div className="text-gray-400 text-sm mt-0.5">{job.company} · {job.location}</div>
              </div>
              {job.remote && (
                <span className="bg-emerald-500/10 text-emerald-300 text-xs px-2 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                  Remote
                </span>
              )}
            </div>
            {job.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.tags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-8">No listings match your search.</p>
      )}
    </div>
  );
}

export default Listings;