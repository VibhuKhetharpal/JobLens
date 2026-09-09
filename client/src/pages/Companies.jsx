import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        const res = await axios.get('/api/trends/companies');
        setCompanies(res.data || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse h-80">
        <div className="h-5 bg-gray-800 rounded w-1/4 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-gray-800/60 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const topThree = companies.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Hirers Leaderboard Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {topThree.map((comp, idx) => {
            const medals = ['🥇 Top Recruiter', '🥈 Runner Up', '🥉 High Volume'];
            const colors = [
              'border-amber-500/30 bg-amber-500/5 text-amber-400',
              'border-slate-400/30 bg-slate-400/5 text-slate-300',
              'border-orange-500/30 bg-orange-500/5 text-orange-400'
            ];
            return (
              <div
                key={comp._id}
                className={`border rounded-xl p-4.5 ${colors[idx]} space-y-1.5`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider">
                  {medals[idx]}
                </div>
                <div className="text-xl font-bold text-white truncate">
                  {comp._id}
                </div>
                <div className="text-xs text-gray-400">
                  {comp.count} active engineering openings
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Chart */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-200">🏢 Top Hiring Tech Companies in India</h2>
            <p className="text-xs text-gray-400 mt-0.5">Companies with the highest volume of active software job listings</p>
          </div>
          <span className="text-xs text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-0.5 rounded-full font-medium">
            Leaderboard
          </span>
        </div>

        {companies.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={companies} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis
                dataKey="_id"
                type="category"
                stroke="#6b7280"
                fontSize={12}
                width={120}
                interval={0}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                formatter={(val) => [`${val} active jobs`, 'Openings']}
              />
              <Bar dataKey="count" fill="#d946ef" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-12 text-center text-gray-500 text-xs">
            No company data found. Run a job sync to populate.
          </div>
        )}
      </div>
    </div>
  );
}

export default Companies;