import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Header.css";

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isAdmin =
    currentUser &&
    (currentUser.email === "admin@pilanitrails.com" ||
      currentUser.isAdmin === true);

  return (
    <header className="app-header">
      <nav className="header-nav">
        {/* Logo / Brand */}
        <div className="nav-brand">
          <Link to="/" className="brand-link" onClick={() => setMenuOpen(false)}>
            Pilani Trails
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" stroke="currentColor" fill="none" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" stroke="currentColor" fill="none" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>

          {!currentUser ? (
            <>
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              </li>
              <li>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>Signup</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              </li>
              <li>
                <Link to="/propose" onClick={() => setMenuOpen(false)}>Propose Location</Link>
              </li>
              {isAdmin && (
                <>
                  <li>
                    <Link to="/admin/review" onClick={() => setMenuOpen(false)}>Admin Review</Link>
                  </li>
                  <li>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
                  </li>
                </>
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
