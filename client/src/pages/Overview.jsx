import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={skillTrends} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
            <XAxis
              dataKey="_id"
              stroke="#888"
              fontSize={12}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
            <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Remote vs Onsite</h2>
        <div className="flex gap-3">
          {remoteSplit.map(r => (
            <span
              key={String(r._id)}
              className="bg-emerald-500/10 text-emerald-300 text-sm px-3 py-1 rounded-full border border-emerald-500/20"
            >
              {r._id === true ? 'Remote' : 'Onsite'}: {r.count}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Top Locations</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={locations} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <XAxis type="number" stroke="#888" fontSize={12} />
            <YAxis dataKey="_id" type="category" stroke="#888" fontSize={12} width={110} interval={0} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
            <Bar dataKey="count" fill="#34d399" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Overview;