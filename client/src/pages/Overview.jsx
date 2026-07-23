import { useEffect, useState } from 'react';
import axios from 'axios';

function Overview() {
  const [skillTrends, setSkillTrends] = useState([]);
  const [remoteSplit, setRemoteSplit] = useState([]);
  const [locations, setLocations] = useState([]);

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
    <div>
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
    </div>
  );
}

export default Overview;