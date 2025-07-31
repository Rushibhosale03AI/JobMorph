// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css'; // We'll make this next

const DashboardPage = () => {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Welcome to Your Dashboard</h2>
      <p className="user-info">Logged in as: <strong>{userEmail}</strong></p>

      <div className="dashboard-actions">
        <Link to="/upload" className="dashboard-button">Upload New Resume</Link>
      </div>

      <div className="dashboard-history">
        <h3>Past Analyses</h3>
        <p className="placeholder">Coming soon: You will be able to view your previous analysis reports here.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
