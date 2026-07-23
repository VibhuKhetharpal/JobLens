import { useEffect, useState } from 'react';
import axios from 'axios';

function Overview() {
  const [skillTrends, setSkillTrends] = useState([]);
  const [remoteSplit, setRemoteSplit] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/skills').then(res => setSkillTrends(res.data));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/remote-split').then(res => setRemoteSplit(res.data));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/locations').then(res => setLocations(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Top Skills This Week</h2>
        <div className="flex flex-wrap gap-2">
          {skillTrends.map(t => (
            <span key={t._id} className="bg-indigo-500/10 text-indigo-300 text-sm px-3 py-1 rounded-full border border-indigo-500/20">
              {t._id} <span className="text-indigo-500">({t.count})</span>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Remote vs Onsite</h2>
        <div className="flex gap-3">
          {remoteSplit.map(r => (
            <span key={String(r._id)} className="bg-emerald-500/10 text-emerald-300 text-sm px-3 py-1 rounded-full border border-emerald-500/20">
              {r._id ? 'Remote' : 'Onsite'}: {r.count}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Top Locations</h2>
        <div className="flex flex-wrap gap-2">
          {locations.map(l => (
            <span key={l._id} className="bg-amber-500/10 text-amber-300 text-sm px-3 py-1 rounded-full border border-amber-500/20">
              {l._id} <span className="text-amber-500">({l.count})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Overview;