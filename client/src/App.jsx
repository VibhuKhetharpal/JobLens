import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import Overview from './pages/Overview';
import Listings from './pages/Listings';
import Companies from './pages/Companies';

function App() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const triggerIngest = async () => {
    try {
      setSyncing(true);
      setSyncStatus('Syncing...');
      const res = await axios.get('/api/ingest');
      setSyncStatus(`Synced ${res.data.count || 0} jobs!`);
      setTimeout(() => {
        setSyncStatus(null);
        window.location.reload();
      }, 1500);
    } catch {
      setSyncStatus('Sync failed');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition text-sm flex items-center gap-1.5 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
        : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800/80'
    }`;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white">JobLens</h1>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <span>🇮🇳</span> India Tech Market
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Real-time hiring trends, tech stack benchmarks, and salary intelligence across India</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerIngest}
                disabled={syncing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className={syncing ? 'animate-spin' : ''}>🔄</span>
                {syncStatus || (syncing ? 'Syncing...' : 'Sync Live Jobs')}
              </button>
            </div>
          </header>

          <nav className="flex gap-2 mb-6 border-b border-gray-800/80 pb-4">
            <NavLink to="/" end className={navClass}>
              📊 Overview & Analytics
            </NavLink>
            <NavLink to="/listings" className={navClass}>
              💼 Indian Job Board
            </NavLink>
            <NavLink to="/companies" className={navClass}>
              🏢 Top Hiring Tech Companies
            </NavLink>
          </nav>

          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/companies" element={<Companies />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;