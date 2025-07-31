// src/components/ResultPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import '../styles/ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  console.log("📊 ResultPage received data:", result);

  if (!result) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h2>No analysis data found.</h2>
        <button onClick={() => navigate('/')}>Back to Upload</button>
      </div>
    );
  }

  // Extract and sanitize score
  const rawScore = result.score ?? result.match_percentage;
  const score = typeof rawScore === 'number' && !isNaN(rawScore)
    ? Math.round(rawScore)
    : 0;

  const pieData = [
    { name: 'Matched', value: score },
    { name: 'Missing', value: 100 - score },
  ];

  const COLORS = ['#4CAF50', '#F44336'];

  return (
    <div className="result-container">
      <h2>Resume Analysis Result</h2>

      <div className="chart-section">
        <PieChart width={320} height={320}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>

        <div className="percentage-display">
          <h3>Match: {score}%</h3>
        </div>
      </div>

      <div className="missing-skills-section">
        <h3>Missing Skills or Experience</h3>

  {console.log("🧪 Debug: result.missing_keywords =", result.missing_keywords)}

{Array.isArray(result.missing_skills) && result.missing_skills.length > 0 ? (
  <ul>
    {result.missing_skills.map((skill, index) => (
      <li key={index}>🔹 {skill}</li>
    ))}
  </ul>
) : (
  <p>No missing skills. You're a great match!</p>
)}

      </div>

      <button onClick={() => navigate('/upload')}>🔄 Analyze New Resume</button>
    </div>
  );
};

export default ResultPage;
