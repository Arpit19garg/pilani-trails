import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Header.css';

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="app-header">
      <nav className="header-nav">
        <div className="nav-brand">
          <Link to="/">Pilani Trails</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          {!currentUser ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Signup</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/propose-location">Propose Location</Link></li>
              {currentUser.isAdmin && (
                <li><Link to="/admin-review">Admin Review</Link></li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
