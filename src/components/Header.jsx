// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Header.css';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <nav className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">Pilani Trails</Link>
        </div>

        {/* Hamburger menu (mobile) */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/">Home</Link></li>

          {currentUser ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/propose">Propose Location</Link></li>
              {currentUser.role === 'admin' && (
                <li><Link to="/admin-review">Admin Review</Link></li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn-outline">Login</Link></li>
              <li><Link to="/signup" className="btn-primary">Signup</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
