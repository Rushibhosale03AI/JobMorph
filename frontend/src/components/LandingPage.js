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
        navigate('/signup');
      }
    });
  };

  return (
    <div className="landing">
      <Navbar />

      {/* Decorative gradient blobs */}
      <div className="bg-blob bg-blob--one" aria-hidden="true" />
      <div className="bg-blob bg-blob--two" aria-hidden="true" />

      <main className="landing__main split">
        <section className="split__left">
          <div className="eyebrow">AI • Careers • Growth</div>
          <h1 className="hero__title" style={{ color: '#2a69d792' }}>
            Boost your job hunt <span className="accent">with AI</span>
          </h1>
          <p className="hero__subtitle">
            Upload your resume and a job description. Instantly see your match score, missing skills, and
            tailored suggestions to improve your chances.
          </p>

          <div className="cta__row">
            <button
              onClick={handleGetStarted}
              className="btn btn--primary"
              aria-label="Get started with AI resume analyzer"
            >
              Get Started
            </button>

            <button
              className="btn btn--subtle"
              onClick={() => navigate('/about')}
              aria-label="Learn how the resume analyzer works"
            >
              How it works
            </button>
          </div>

          <ul className="benefits" aria-label="Key benefits">
            <li>Smart skill gap detection</li>
            <li>Actionable suggestions</li>
            <li>Private and secure</li>
          </ul>
        </section>

        <section className="split__right">
          <div className="image__frame" role="img" aria-label="Illustration of resume analysis">
            <img
              src={resumeImg}
              alt="Illustration: AI analyzing resume vs job description"
              className="hero__image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>
      </main>

      <footer className="landing__footer">
        <span>© {new Date().getFullYear()} AI Resume Analyzer</span>
        <nav className="footer__links" aria-label="Footer">
          <button className="linklike" onClick={() => navigate('/privacy')}>Privacy</button>
          <button className="linklike" onClick={() => navigate('/terms')}>Terms</button>
          <button className="linklike" onClick={() => navigate('/contact')}>Contact</button>
        </nav>
      </footer>
    </div>
  );
};

export default LandingPage;
