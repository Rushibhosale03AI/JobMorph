// src/pages/HowItWorksPage.js (Updated)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { auth } from '../firebase'; // 1. Import auth from Firebase
import { FaFileUpload, FaBrain, FaChartPie } from 'react-icons/fa';
import '../styles/HowItWorksPage.css';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  // 2. Create a handler to check auth state before navigating
  const handleGetStartedClick = () => {
    if (auth.currentUser) {
      // User is signed in, go to the dashboard
      navigate('/dashboard');
    } else {
      // User is not signed in, go to the signup page
      navigate('/signup');
    }
  };

  return (
    <div className="how-it-works-page">
      <Navbar />

      <main className="hiw-main-content">
        <div className="hiw-header">
          <h1>From Upload to Offer in 3 Simple Steps</h1>
          <p className="hiw-subtitle">
            JobMorph takes the guesswork out of job applications by showing you exactly where you stand.
          </p>
        </div>

        <div className="steps-container">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-icon-container" style={{ backgroundColor: '#e0f2fe' }}>
              <FaFileUpload className="step-icon" style={{ color: '#0ea5e9' }} />
            </div>
            <h3>Step 1: Provide Your Documents</h3>
            <p>
              Simply upload your current resume and paste the full text of the job description you're interested in.
              Your data is kept private and secure.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-icon-container" style={{ backgroundColor: '#ede9fe' }}>
              <FaBrain className="step-icon" style={{ color: '#8b5cf6' }} />
            </div>
            <h3>Step 2: Instant AI Analysis</h3>
            <p>
              Our advanced AI gets to work, comparing your skills and experience against the job's key requirements
              and keywords in real-time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-icon-container" style={{ backgroundColor: '#dcfce7' }}>
              <FaChartPie className="step-icon" style={{ color: '#22c55e' }} />
            </div>
            <h3>Step 3: Get Actionable Insights</h3>
            <p>
              Receive a detailed report including your match score, a list of missing skills, and tailored suggestions
              to enhance your resume.
            </p>
          </div>
        </div>
        
        <div className="hiw-cta-section">
          <h2>Ready to stand out?</h2>
          <p>Analyze your resume now and take the next step in your career.</p>
          {/* 3. Update the button's onClick handler */}
          <button className="btn btn--primary" onClick={handleGetStartedClick}>
            Get Started for Free
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;