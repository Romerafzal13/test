import React, { useEffect, useState } from 'react';

function Leaderboard({ onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leaderboard');
        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;

  return (
    <div style={{ border: '2px solid navy', padding: '20px', borderRadius: '10px', backgroundColor: '#f0f8ff' }}>
      <h2 style={{ color: 'darkblue' }}>🏆 Leaderboard</h2>
      <table style={{ margin: 'auto', width: '80%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#d0e0ff' }}>
            <th>User</th>
            <th>Score</th>
            <th>Total</th>
            <th>%</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((entry, i) => (
            <tr key={i} style={{ borderBottom: '1px solid lightgray' }}>
              <td>{entry.username}</td>
              <td>{entry.score}</td>
              <td>{entry.total}</td>
              <td>{((entry.score / entry.total) * 100).toFixed(1)}%</td>
              <td>
                {entry.mode === 1
                  ? 'Capital → Country'
                  : `Country → Capital (${entry.continent || 'All'})`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <button onClick={onClose} style={{ background: 'lightblue', padding: '10px 20px' }}>Close</button>
    </div>
  );
}

export default Leaderboard;