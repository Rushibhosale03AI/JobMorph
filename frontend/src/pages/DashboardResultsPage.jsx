import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import '../styles/DashboardResults.css';

const DashboardResultsPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [uid, setUid] = useState('');
  const [items, setItems] = useState([]);        // past analyses
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();

  // Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || '');
        setUid(user.uid);
      } else {
        setUserEmail('');
        setUid('');
        setItems([]);
        setSelectedId(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // Stream past analyses
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr('');

    const colRef = collection(db, 'users', uid, 'results');
    const q = query(colRef, orderBy('created_at', 'desc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = [];
        snap.forEach((doc) => {
          const d = doc.data();
          data.push({
            id: doc.id,
            created_at: d.created_at?.toDate ? d.created_at.toDate() : (d.created_at ? new Date(d.created_at) : null),
            match_percentage: d.match_percentage ?? d.score ?? 0,
            missing_keywords: Array.isArray(d.missing_keywords)
              ? d.missing_keywords
              : (Array.isArray(d.missing_skills) ? d.missing_skills : []),
            suggestions: Array.isArray(d.suggestions) ? d.suggestions : [],
            resume: d.resume || '',
            job_description: d.job_description || '',
            learning_resources: Array.isArray(d.learning_resources) ? d.learning_resources : [],
          });
        });
        setItems(data);
        setLoading(false);

        // Default select first item when list loads
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      },
      (e) => {
        console.error('Firestore stream error:', e);
        setErr('Failed to load your analyses.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid, selectedId]);

  const selected = useMemo(() => {
    return items.find((x) => x.id === selectedId) || null;
  }, [items, selectedId]);

  const score = useMemo(() => {
    const raw = selected?.match_percentage ?? 0;
    const n = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 0;
    return n;
  }, [selected]);

  const pieData = useMemo(() => ([
    { name: 'Matched', value: score },
    { name: 'Missing', value: 100 - score },
  ]), [score]);

  const COLORS = ['#4CAF50', '#F44336'];

  const openUpload = () => navigate('/upload');

  return (
    <div className="dr-container">
      <header className="dr-header">
        <h2 className="dr-title">Analyses</h2>
        <div className="dr-right">
          <span className="dr-user">{uid ? `Logged in as: ${userEmail}` : 'Not logged in'}</span>
          <button className="dr-new" onClick={openUpload}>+ New Analysis</button>
        </div>
      </header>

      <section className="dr-content">
        {/* List panel */}
        <aside className="dr-list">
          <h3 className="dr-list-title">Past Analyses</h3>

          {loading && <p className="muted">Loading…</p>}
          {err && <p className="error">{err}</p>}

          {!loading && !err && items.length === 0 && (
            <div className="placeholder">
              No analyses yet. Click <strong>“+ New Analysis”</strong> to get started.
            </div>
          )}

          <ul className="dr-items">
            {items.map((it) => (
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
                <div className="dr-chips">
                  {(it.missing_keywords || []).slice(0, 3).map((kw, i) => (
                    <span key={`${it.id}-chip-${i}`} className="dr-chip">{kw}</span>
                  ))}
                  {it.missing_keywords.length > 3 && (
                    <span className="dr-chip more">+{it.missing_keywords.length - 3} more</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Detail panel */}
        <main className="dr-detail">
          {!selected ? (
            <div className="placeholder">Select an analysis to see details.</div>
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
                  </div>
                </div>

                {/* Missing skills */}
                <div className="dr-card">
                  <h4>Missing Skills / Experience</h4>
                  {Array.isArray(selected.missing_keywords) && selected.missing_keywords.length > 0 ? (
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
                  {Array.isArray(selected.suggestions) && selected.suggestions.length > 0 ? (
                    <ul className="list">
                      {selected.suggestions.map((s, i) => (
                        <li key={`s-${i}`}>• {s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No suggestions available.</p>
                  )}
                </div>

                {/* Learning resources */}
                <div className="dr-card">
                  <h4>Learning Resources</h4>
                  {Array.isArray(selected.learning_resources) && selected.learning_resources.length > 0 ? (
                    <ul className="list">
                      {selected.learning_resources.slice(0, 8).map((r, i) => (
                        <li key={`r-${i}`}>
                          <strong>{r.skill || r.title || 'Resource'}: </strong>
                          {r.resource || r.url ? (
                            <a href={(r.resource || r.url)} target="_blank" rel="noreferrer">
                              {(r.resource || r.url)}
                            </a>
                          ) : (r.description || '—')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No resources attached.</p>
                  )}
                </div>

                {/* Raw text previews (optional) */}
                <div className="dr-card">
                  <h4>Job Description (excerpt)</h4>
                  <pre className="pre">{(selected.job_description || '').slice(0, 1200) || '—'}</pre>
                </div>
                <div className="dr-card">
                  <h4>Resume (excerpt)</h4>
                  <pre className="pre">{(selected.resume || '').slice(0, 1200) || '—'}</pre>
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
