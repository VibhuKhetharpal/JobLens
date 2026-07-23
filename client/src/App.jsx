import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [listings, setListings] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/skills')
      .then(res => setTrends(res.data));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings')
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>JobLens</h1>

      <h2>Top Skills This Week</h2>
      {trends.map(t => (
        <div key={t._id}>{t._id}: {t.count}</div>
      ))}

      {listings.map(job => (
        <div key={job._id}>
          <strong>{job.title}</strong> — {job.company} ({job.location})
        </div>
      ))}
    </div>
  );
}

export default App;