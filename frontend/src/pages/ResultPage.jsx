// src/components/ResultPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  console.log('📊 ResultPage received data:', result);

  // You can safely early-return before any hooks after this.
  if (!result) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h2>No analysis data found.</h2>
        <button onClick={() => navigate('/')}>Back to Upload</button>
      </div>
    );
  }

  // ---- Derived values WITHOUT hooks ----
  // Normalize score: prefer `score`, else `match_percentage`
  const raw = Number.isFinite(result?.score) ? result.score : result?.match_percentage;
  const scoreNum = Number(raw);
  const score = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, Math.round(scoreNum))) : 0;

  // Normalize missing list: prefer `missing_keywords`, else `missing_skills`
  const missingRaw = Array.isArray(result?.missing_keywords)
    ? result.missing_keywords
    : Array.isArray(result?.missing_skills)
    ? result.missing_skills
    : [];
  const missing = missingRaw
    .map((s) => String(s).replace(/^[\s"']+|[\s"']+$/g, '').trim())
    .filter(Boolean);

  // Optional suggestions list
  const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];

  const pieData = [
    { name: 'Matched', value: score },
    { name: 'Missing', value: 100 - score },
  ];
  const COLORS = ['#4CAF50', '#F44336'];

  // Debug
  console.log('🧪 normalized score:', score);
  console.log('🧪 normalized missing:', missing);

  return (
    <div className="result-container">
      <h2>Resume Analysis Result</h2>

      <div className="chart-section">
        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
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
          </ResponsiveContainer>
        </div>

        <div className="percentage-display">
          <h3>Match: {score}%</h3>
        </div>
      </div>

      <div className="missing-skills-section">
        <h3>Missing Skills or Experience</h3>
        {missing.length > 0 ? (
          <ul>
            {missing.map((skill, index) => (
              <li key={`${skill}-${index}`}>🔹 {skill}</li>
            ))}
          </ul>
        ) : (
          <p>No missing skills. You're a great match!</p>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3>Suggestions to Improve</h3>
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>💡 {s}</li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => navigate('/upload')}>🔄 Analyze New Resume</button>
    </div>
  );
};

export default ResultPage;
