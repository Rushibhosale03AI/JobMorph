import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaTachometerAlt, FaClipboardList, FaArrowRight } from 'react-icons/fa';
import '../styles/MainDashboard.css';

const MainDashboardPage = () => {
  const { items } = useOutletContext();
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    if (!items || items.length === 0) return [];
    // Sort items by date ascending for the chart
    return [...items]
      .sort((a, b) => new Date(a.created_at.seconds * 1000) - new Date(b.created_at.seconds * 1000))
      .map(item => ({
        date: new Date(item.created_at.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(item.match_percentage ?? item.score ?? 0),
      }));
  }, [items]);

  const stats = useMemo(() => {
    if (!items || items.length === 0) {
      return { highestScore: 0, totalAnalyses: 0, recentItems: [] };
    }
    const scores = items.map(it => it.match_percentage ?? it.score ?? 0);
    // The items are already sorted descending, so we can just take the first few
    const recentItems = items.slice(0, 3);

    return {
      highestScore: Math.round(Math.max(...scores)),
      totalAnalyses: items.length,
      recentItems,
    };
  }, [items]);

  return (
    <div className="main-dashboard-container">
      <h1 className="main-dashboard-title">Dashboard</h1>
      <p className="main-dashboard-subtitle">Welcome back! Here's your performance summary.</p>

      {/* --- STATS CARDS --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#2563eb' }}>
            <FaTachometerAlt />
          </div>
          <div className="stat-card-info">
            <h4>Highest Score</h4>
            <p>{stats.highestScore}%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#16a34a' }}>
            <FaClipboardList />
          </div>
          <div className="stat-card-info">
            <h4>Total Analyses</h4>
            <p>{stats.totalAnalyses}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* --- PERFORMANCE CHART --- */}
        <div className="dashboard-card">
          <h3>Performance Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- RECENT ACTIVITY --- */}
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <ul className="recent-list">
            {stats.recentItems.length > 0 ? (
              stats.recentItems.map(item => (
                <li key={item.id} onClick={() => navigate('/dashboard/history')}>
                  <div className="recent-item-info">
                    <span>Analysis from {new Date(item.created_at.seconds * 1000).toLocaleDateString()}</span>
<span className="recent-item-score">{Math.round(item.match_percentage ?? item.score ?? 0)}%</span>                  </div>
                  <FaArrowRight className="recent-item-arrow" />
                </li>
              ))
            ) : (
              <p className="no-activity">No recent analyses to show.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MainDashboardPage;