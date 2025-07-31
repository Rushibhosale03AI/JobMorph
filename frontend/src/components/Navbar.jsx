import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Navbar.css';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">JobMorph</Link>
      </div>

      <div className="navbar-links">
        {currentUser && <Link to="/upload">Upload</Link>}

        {currentUser ? (
          <>
            <span className="navbar-user">{currentUser.email}</span>
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
