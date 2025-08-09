import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { auth } from '../firebase';
import { FcGoogle } from 'react-icons/fc'; // For the Google logo
import '../styles/Auth.css'; // Uses the same professional CSS file
import { IoArrowBack } from 'react-icons/io5'; // NEW: Import the back arrow icon


const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);

    // 1. Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    // 2. Try to create the user
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Navigate to a protected route on success
    } catch (err) {
      // Provide a more user-friendly error message
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
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
        <form className="auth-form" onSubmit={handleSignup}>
          <h2>Create an Account</h2>
          <p className="auth-subtitle">Start your journey with JobMorph today.</p>

          {error && <p className="error-message">{error}</p>}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="•••••••• (min. 6 characters)"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="separator">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <FcGoogle size={22} />
            <span>Sign up with Google</span>
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;