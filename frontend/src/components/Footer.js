// src/components/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section footer-about">
          <h3 className="footer-logo">JobMorph</h3>
          <p>
            Supercharge your job applications with AI-powered resume analysis.
          </p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-section footer-links">
          <h4>Product</h4>
          <ul>
            <li><Link to="/#features">Features</Link></li>
            <li><Link to="/about">How it Works</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-links">
          <h4>Company</h4>
          <ul>
            <li><Link to="/jobmorphabout">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-links">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} JobMorph. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;