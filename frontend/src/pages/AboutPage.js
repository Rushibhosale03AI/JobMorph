// src/pages/AboutPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaBullseye, FaUserShield, FaLightbulb } from 'react-icons/fa';
import '../styles/AboutPage.css';
import { auth } from '../firebase'; 

const AboutPage = () => {
  const navigate = useNavigate();
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
    <div className="about-page">
      <Navbar />
      <main className="about-main-content">
        <section className="about-hero">
          <div className="about-hero-text">
            <h1>Our Mission: Empowering Your Career Journey</h1>
            <p className="subtitle">
              We believe that landing your dream job shouldn't be a game of chance. JobMorph was founded to level the playing field by giving job seekers the same powerful tools that recruiters use.
            </p>
          </div>
          
        </section>

        <section className="our-values">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <FaUserShield className="value-icon" />
              <h3>User-Centric</h3>
              <p>Your success is our success. We build tools that are intuitive, powerful, and designed to deliver real results for your career.</p>
            </div>
            <div className="value-card">
              <FaBullseye className="value-icon" />
              <h3>Data-Driven Insights</h3>
              <p>We leverage cutting-edge AI to provide objective, actionable feedback, transforming ambiguity into a clear path forward.</p>
            </div>
            <div className="value-card">
              <FaLightbulb className="value-icon" />
              <h3>Constant Innovation</h3>
              <p>The job market is always evolving, and so are we. We are committed to continuously improving our technology to meet your needs.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Take Control of Your Job Hunt?</h2>
          <button className="btn btn--primary" onClick={handleGetStartedClick}>
            Get Started Now
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;