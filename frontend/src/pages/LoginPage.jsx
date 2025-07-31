import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/Auth.css'; // Professional CSS

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      alert('Google login failed: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login to JobMorph</h2>
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
        <button type="submit" className="auth-button">Login</button>
        <div className="separator">or</div>
        <button type="button" className="google-button" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
        <p className="auth-footer">
          Don't have an account? <a href="/signup">Sign up here</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
