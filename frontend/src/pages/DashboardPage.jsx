// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [uid, setUid] = useState('');
  const [items, setItems] = useState([]);        // past analyses
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || '');
        setUid(user.uid);
      } else {
        setUserEmail('');
        setUid('');
        setItems([]);
      }
    });
    return () => unsubAuth();
  }, []);

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
            created_at: d.created_at?.toDate ? d.created_at.toDate() : new Date(d.created_at),
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
      },
      (e) => {
        console.error('Firestore stream error:', e);
        setErr('Failed to load your past analyses.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  const openResult = (item) => {
    navigate('/result', {
      state: {
        result: {
          resume: item.resume,
          job_description: item.job_description,
          match_percentage: item.match_percentage,
          missing_skills: item.missing_keywords,   // keep same key your ResultPage expects
          suggestions: item.suggestions,
          learning_resources: item.learning_resources,
          score: item.match_percentage,            // also provide score alias
        },
      },
    });
  };

  return (
    <div className="dashboard-container">
      <h2 className="dash-title">Your Dashboard</h2>

      <div className="dash-header">
        <p className="user-info">
          {uid ? (
            <>Logged in as: <strong>{userEmail}</strong></>
          ) : (
            <>You are not logged in.</>
          )}
        </p>

        <div className="dashboard-actions">
          <Link to="/upload" className="dashboard-button">+ New Analysis</Link>
        </div>
      </div>

      <section className="dashboard-history">
        <h3>Past Analyses</h3>

        {loading && <p className="muted">Loading your analyses…</p>}
        {err && <p className="error">{err}</p>}

        {!loading && !err && items.length === 0 && (
          <p className="placeholder">
            No analyses yet. Click <strong>“+ New Analysis”</strong> to get started.
          </p>
        )}

        <div className="results-grid">
          {items.map((item) => (
            <article key={item.id} className="result-card" onClick={() => openResult(item)}>
              <div className="result-card-head">
                <span className="badge">Match</span>
                <span className="score">{Math.round(item.match_percentage)}%</span>
              </div>

              <div className="result-card-body">
                <p className="when">
                  {item.created_at ? item.created_at.toLocaleString() : '—'}
                </p>

                <div className="chips">
                  {(item.missing_keywords || []).slice(0, 4).map((kw, i) => (
                    <span className="chip" key={`${item.id}-kw-${i}`}>{kw}</span>
                  ))}
                  {item.missing_keywords.length > 4 && (
                    <span className="chip more">+{item.missing_keywords.length - 4} more</span>
                  )}
                </div>

                {item.suggestions?.length > 0 && (
                  <ul className="suggestions">
                    {item.suggestions.slice(0, 2).map((s, i) => (
                      <li key={`${item.id}-sg-${i}`}>• {s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="result-card-foot">
                <button className="view-btn" type="button">View Details</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
