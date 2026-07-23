import { useEffect, useState } from 'react';
import axios from 'axios';

function Companies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/companies').then(res => setCompanies(res.data));
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-200 mb-4">Top Hiring Companies</h2>
      <div className="flex flex-wrap gap-2">
        {companies.map(c => (
          <span key={c._id} className="bg-fuchsia-500/10 text-fuchsia-300 text-sm px-3 py-1 rounded-full border border-fuchsia-500/20">
            {c._id} <span className="text-fuchsia-500">({c.count})</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Companies;