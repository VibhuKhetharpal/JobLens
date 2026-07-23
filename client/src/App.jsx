import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Overview from './pages/Overview';
import Listings from './pages/Listings';
import Companies from './pages/Companies';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="dashboard">
        <h1>JobLens</h1>
        <p className="job-meta">Live job-market intelligence dashboard</p>

        <nav className="nav">
          <Link to="/">Overview</Link>
          <Link to="/listings">Listings</Link>
          <Link to="/companies">Companies</Link>
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