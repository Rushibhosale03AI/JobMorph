import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/Auth.css';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      alert('Signup failed: ' + err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      alert('Google signup failed: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2>Create Your JobMorph Account</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">Sign Up</button>
        <div className="separator">or</div>
        <button type="button" className="google-button" onClick={handleGoogleSignup}>
          Sign up with Google
        </button>
        <p className="auth-footer">
          Already have an account? <a href="/login">Log in here</a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
