// src/components/Sidebar.js (Corrected)

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
// FIXED: Added FaThLarge to the import
import { FaHistory, FaSignOutAlt, FaPlus, FaTachometerAlt, FaThLarge } from 'react-icons/fa';
import '../styles/DashboardLayout.css';

const Sidebar = ({ userEmail, highestScore }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h3>JobMorph</h3>
      </div>

      <div className="sidebar-new-analysis">
        <button onClick={() => navigate('/dashboard/upload')}>
          <FaPlus /> New Analysis
        </button>
      </div>

      <div className="sidebar-stat-card">
        <h4>Highest Match</h4>
        <div className="stat-score">
          <FaTachometerAlt />
          <span>{highestScore}%</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" end>
              <FaThLarge /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/history">
              <FaHistory /> History {/* FIXED: Typo removed */}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-email" title={userEmail}>{userEmail}</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;