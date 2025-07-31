// src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import '../styles/LandingPage.css';
import resumeImg from '../assests/Gemini_Generated_Image_88p6oc88p6oc88p6.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    });
  };

  return (
    <div className="landing-container">
      <Navbar />

      <main className="landing-main split-layout">
        <div className="left-section">
          <h2>Boost Your Job Hunt with AI</h2>
          <p>
            Upload your resume and job description to get instant skill match and missing skill suggestions.
          </p>
          <button onClick={handleGetStarted} className="start-btn">
            Get Started
          </button>
        </div>
        <div className="right-section">
          <img src={resumeImg} alt="Resume Illustration" className="landing-image" />
        </div>
      </main>

      <footer className="landing-footer">
        &copy; {new Date().getFullYear()} AI Resume Analyzer. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
