import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [listings, setListings] = useState([]);
  const [skillTrends, setSkillTrends] = useState([]);
  const [remoteSplit, setRemoteSplit] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings').then(res => setListings(res.data));
  }, []);

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
    <div className="dashboard">
      <h1>JobLens</h1>
      <p className="job-meta">Live job-market intelligence dashboard</p>

      <div className="section">
        <h2>Top Skills This Week</h2>
        <div className="tag-list">
          {skillTrends.map(t => (
            <span className="tag" key={t._id}>{t._id} ({t.count})</span>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Remote vs Onsite</h2>
        <div className="tag-list">
          {remoteSplit.map(r => (
            <span className="tag" key={String(r._id)}>
              {r._id ? 'Remote' : 'Onsite'}: {r.count}
            </span>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Top Locations</h2>
        <div className="tag-list">
          {locations.map(l => (
            <span className="tag" key={l._id}>{l._id} ({l.count})</span>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Listings</h2>
        {listings.map(job => (
          <div className="job-card" key={job._id}>
            <div className="job-title">{job.title}</div>
            <div className="job-meta">{job.company} — {job.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;