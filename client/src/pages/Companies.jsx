import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Companies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/companies').then(res => setCompanies(res.data));
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-200 mb-4">Top Hiring Companies</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={companies} layout="vertical">
          <XAxis type="number" stroke="#888" fontSize={12} />
          <YAxis dataKey="_id" type="category" stroke="#888" fontSize={12} width={140} interval={0} />
          <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
          <Bar dataKey="count" fill="#e879f9" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Companies;