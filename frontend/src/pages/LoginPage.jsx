// src/pages/LoginPage.js (Updated)

import React, { useState } from 'react';
// NEW: Import sendPasswordResetEmail from Firebase
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { FcGoogle } from 'react-icons/fc';
import { IoArrowBack } from 'react-icons/io5';
import '../styles/Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // NEW: State for success messages
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // NEW: Handler for the password reset functionality
  const handlePasswordReset = async () => {
    // Clear previous messages first
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent! Please check your email inbox.');
    } catch (err) {
      setError('Could not send password reset email. Please check if the email address is correct.');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
    setLoading(false);
  };

  // ... (handleGoogleLogin remains the same)
  const handleGoogleLogin = async () => {
    /* ... */
    setError('');
        setLoading(true);
        try {
          await signInWithPopup(auth, provider);
          navigate('/dashboard'); // Navigate to a protected route on success
        } catch (err) {
          setError('Failed to sign up with Google. Please try again.');
        }
        setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button
          onClick={() => navigate('/')}
          className="back-button"
          aria-label="Go back to landing page"
        >
          <IoArrowBack />
        </button>

        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Welcome Back!</h2>
          <p className="auth-subtitle">Login to your JobMorph account.</p>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>} {/* NEW: Display success message */}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage(''); // Clear message on new input
              }}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* NEW: Forgot Password Link */}
          <div className="forgot-password-link">
            <button type="button" onClick={handlePasswordReset} disabled={loading}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="separator">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle size={22} />
            <span>Sign in with Google</span>
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;