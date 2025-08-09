// src/pages/DashboardResultsPage.jsx (COMPLETE AND CORRECTED)

import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import '../styles/DashboardResults.css';

const DashboardResultsPage = () => {
  const { items } = useOutletContext();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (items && items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const formattedItems = useMemo(() => {
    return items.map(d => ({
      id: d.id,
      created_at: d.created_at?.toDate ? d.created_at.toDate() : (d.created_at ? new Date(d.created_at) : null),
      match_percentage: d.match_percentage ?? d.score ?? 0,
      missing_keywords: Array.isArray(d.missing_keywords) ? d.missing_keywords : (Array.isArray(d.missing_skills) ? d.missing_skills : []),
      suggestions: Array.isArray(d.suggestions) ? d.suggestions : [],
      resume: d.resume || '',
      job_description: d.job_description || '',
      learning_resources: Array.isArray(d.learning_resources) ? d.learning_resources : [],
    }));
  }, [items]);

  const selected = useMemo(() => {
    return formattedItems.find((x) => x.id === selectedId) || null;
  }, [formattedItems, selectedId]);

  const score = useMemo(() => {
    const raw = selected?.match_percentage ?? 0;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }, [selected]);

  const pieData = useMemo(() => ([
    { name: 'Matched', value: score },
    { name: 'Missing', value: 100 - score },
  ]), [score]);

  const COLORS = ['#4CAF50', '#F44336'];

  return (
    <div className="dr-container-refactored">
      <section className="dr-content">
        {/* List panel */}
        <aside className="dr-list">
          <h3 className="dr-list-title">Analysis History</h3>
          {formattedItems.length === 0 && (
            <div className="placeholder">
              No analyses yet. Click <strong>“+ New Analysis”</strong> in the sidebar to get started.
            </div>
          )}
          <ul className="dr-items">
            {formattedItems.map((it) => (
              <li
                key={it.id}
                className={`dr-item ${selectedId === it.id ? 'active' : ''}`}
                onClick={() => setSelectedId(it.id)}
              >
                <div className="dr-item-top">
                  <span className="dr-badge">Match</span>
                  <span className="dr-score">{Math.round(it.match_percentage)}%</span>
                </div>
                <p className="dr-when">
                  {it.created_at ? it.created_at.toLocaleString() : '—'}
                </p>
              </li>
            ))}
          </ul>
        </aside>

        {/* Detail panel */}
        <main className="dr-detail">
          {!selected ? (
            <div className="placeholder">Select an analysis from the left to see details.</div>
          ) : (
            <>
              <div className="dr-detail-head">
                <h3>Result Details</h3>
                <div className="dr-detail-meta">
                  <span className="dr-meta-pill">Score: {score}%</span>
                  <span className="dr-meta-pill">
                    {selected.created_at ? selected.created_at.toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              <div className="dr-grid">
                {/* Chart */}
                <div className="dr-card">
                  <h4>Match Overview</h4>
                  <div className="chart-wrap">
                    <PieChart width={300} height={300}>
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
                  </div>
                </div>

                {/* Missing skills */}
                <div className="dr-card">
                  <h4>Missing Skills / Experience</h4>
                  {selected.missing_keywords?.length > 0 ? (
                    <ul className="list">
                      {selected.missing_keywords.map((kw, i) => (
                        <li key={`kw-${i}`}>🔹 {kw}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No missing skills detected.</p>
                  )}
                </div>

                {/* Suggestions */}
                <div className="dr-card">
                  <h4>Suggestions</h4>
                  {selected.suggestions?.length > 0 ? (
                    <ul className="list">
                      {selected.suggestions.map((s, i) => (
                        <li key={`s-${i}`}>• {s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No suggestions available.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </section>
    </div>
  );
};

export default DashboardResultsPage;