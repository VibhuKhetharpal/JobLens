import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [listings, setListings] = useState([]);
  const [skillTrends, setSkillTrends] = useState([]);
  const [remoteSplit, setRemoteSplit] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings')
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/skills')
      .then(res => setSkillTrends(res.data));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/remote-split')
      .then(res => setRemoteSplit(res.data));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/locations')
      .then(res => setLocations(res.data));
  }, []);

  return (
    <div>
      <h1>JobLens</h1>

      <h2>Top Skills This Week</h2>
      {skillTrends.map(t => (
        <div key={t._id}>{t._id}: {t.count}</div>
      ))}

      <h2>Remote vs Onsite</h2>
      {remoteSplit.map(r => (
        <div key={String(r._id)}>{r._id ? 'Remote' : 'Onsite'}: {r.count}</div>
      ))}

      <h2>Top Locations</h2>
      {locations.map(l => (
        <div key={l._id}>{l._id}: {l.count}</div>
      ))}

      <h2>Listings</h2>
      {listings.map(job => (
        <div key={job._id}>
          <strong>{job.title}</strong> — {job.company} ({job.location})
        </div>
      ))}
    </div>
  );
}

export default App;