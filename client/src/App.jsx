import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings')
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>JobLens</h1>
      {listings.map(job => (
        <div key={job._id}>
          <strong>{job.title}</strong> — {job.company} ({job.location})
        </div>
      ))}
    </div>
  );
}

export default App;