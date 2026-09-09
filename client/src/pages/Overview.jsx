import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Overview() {
  const [skillTrends, setSkillTrends] = useState([]);
  const [remoteSplit, setRemoteSplit] = useState([]);
  const [locations, setLocations] = useState([]);
  const [salaryTrends, setSalaryTrends] = useState([]);
  const [skillPairs, setSkillPairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [skillsRes, remoteRes, locsRes, salRes, pairsRes] = await Promise.allSettled([
          axios.get('/api/trends/skills'),
          axios.get('/api/trends/remote-split'),
          axios.get('/api/trends/locations'),
          axios.get('/api/trends/salaries'),
          axios.get('/api/trends/skill-pairs')
        ]);

        if (skillsRes.status === 'fulfilled') setSkillTrends(skillsRes.value.data || []);
        if (remoteRes.status === 'fulfilled') setRemoteSplit(remoteRes.value.data || []);
        if (locsRes.status === 'fulfilled') setLocations(locsRes.value.data || []);
        if (salRes.status === 'fulfilled') setSalaryTrends(salRes.value.data || []);
        if (pairsRes.status === 'fulfilled') setSkillPairs(pairsRes.value.data || []);
      } catch (err) {
        console.error('Error fetching overview metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalJobs = remoteSplit.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const remoteJobs = remoteSplit.find(r => r._id === true)?.count || 0;
  const remotePct = totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 0;
  const topHub = locations[0]?._id || 'Bengaluru';
  const topSkill = skillTrends[0]?._id || 'React';

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-900 border border-gray-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-72 bg-gray-900 border border-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium">Tracked Jobs</div>
          <div className="text-2xl font-bold text-white mt-1">{totalJobs}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">🇮🇳 Pan-India Tech</div>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium">Top Hiring Hub</div>
          <div className="text-xl font-bold text-indigo-400 mt-1 truncate">{topHub}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Leading demand</div>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium">#1 In-Demand Tech</div>
          <div className="text-xl font-bold text-violet-400 mt-1 truncate">{topSkill}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Most tagged stack</div>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium">Remote Roles</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{remotePct}%</div>
          <div className="text-[11px] text-gray-500 mt-0.5">{remoteJobs} positions</div>
        </div>
      </div>

      {/* Top Skills Chart */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-200">🔥 Top Tech Stacks & Skills in India</h2>
          <span className="text-xs text-gray-500">Frequency across active job postings</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={skillTrends} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
            <XAxis
              dataKey="_id"
              stroke="#6b7280"
              fontSize={12}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              formatter={(val) => [`${val} jobs`, 'Openings']}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Grid: Locations & Salaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">📍 Openings by Indian Tech Hub</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={locations} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis dataKey="_id" type="category" stroke="#6b7280" fontSize={12} width={90} interval={0} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                formatter={(val) => [`${val} jobs`, 'Listings']}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Benchmarks */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-200">💰 Average Tech Salary (₹ LPA)</h2>
            <span className="text-xs text-purple-400 font-medium">In Lakhs / year</span>
          </div>
          {salaryTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salaryTrends} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="city" type="category" stroke="#6b7280" fontSize={12} width={90} interval={0} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  formatter={(val) => [`₹${val} LPA`, 'Average']}
                />
                <Bar dataKey="avgLpa" fill="#a855f7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-gray-500">
              Ingesting salary data...
            </div>
          )}
        </div>
      </div>

      {/* Skill Co-occurrence Insights */}
      {skillPairs.length > 0 && (
        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-200">⚡ Frequently Paired Tech Skills</h2>
              <p className="text-xs text-gray-400 mt-0.5">Technologies recruiters look for together in candidate profiles</p>
            </div>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
              High Synergy
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {skillPairs.map((pair, i) => (
              <div
                key={i}
                className="bg-gray-950 border border-gray-800/90 rounded-lg p-3 hover:border-gray-700 transition flex items-center justify-between"
              >
                <div className="font-medium text-xs text-gray-200 truncate mr-2">{pair._id}</div>
                <span className="text-[11px] font-semibold bg-gray-800 text-gray-400 px-2 py-0.5 rounded shrink-0">
                  {pair.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Overview;