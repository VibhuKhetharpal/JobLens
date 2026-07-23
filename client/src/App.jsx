import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Overview from './pages/Overview';
import Listings from './pages/Listings';
import Companies from './pages/Companies';

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-900">JobLens</h1>
        <p className="text-gray-500 text-sm mb-6">Live job-market intelligence dashboard</p>

        <nav className="flex gap-5 mb-6 border-b border-gray-200 pb-3">
          <Link to="/" className="text-indigo-600 font-semibold hover:text-indigo-800">Overview</Link>
          <Link to="/listings" className="text-indigo-600 font-semibold hover:text-indigo-800">Listings</Link>
          <Link to="/companies" className="text-indigo-600 font-semibold hover:text-indigo-800">Companies</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/companies" element={<Companies />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;