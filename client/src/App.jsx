import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Overview from './pages/Overview';
import Listings from './pages/Listings';
import Companies from './pages/Companies';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-2xl font-bold text-white">JobLens</h1>
          <p className="text-gray-400 text-sm mb-6">Live job-market intelligence dashboard</p>

          <nav className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
            <Link to="/" className="px-4 py-2 rounded-lg bg-gray-900 text-indigo-400 font-medium hover:bg-gray-800 hover:text-indigo-300 transition">Overview</Link>
            <Link to="/listings" className="px-4 py-2 rounded-lg bg-gray-900 text-indigo-400 font-medium hover:bg-gray-800 hover:text-indigo-300 transition">Listings</Link>
            <Link to="/companies" className="px-4 py-2 rounded-lg bg-gray-900 text-indigo-400 font-medium hover:bg-gray-800 hover:text-indigo-300 transition">Companies</Link>
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