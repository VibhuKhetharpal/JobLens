import { useEffect, useState } from 'react';
import axios from 'axios';

function Companies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends/companies').then(res => setCompanies(res.data));
  }, []);

  return (
    <div className="section">
      <h2>Top Hiring Companies</h2>
      <div className="tag-list">
        {companies.map(c => (
          <span className="tag" key={c._id}>{c._id} ({c.count})</span>
        ))}
      </div>
    </div>
  );
}

export default Companies;