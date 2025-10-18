import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Header.css";

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // debug: show currentUser in console so you can verify role merging
  console.log("[Header] currentUser:", currentUser);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMenu = () => setMenuOpen((s) => !s);

  // Robust admin check: accept role 'admin', isAdmin flag, or specific email (optional)
  const isAdmin =
    currentUser &&
    (currentUser.role === "admin" ||
      currentUser.isAdmin === true ||
      currentUser.email === "admin@pilanitrails.com");

  // Logo element fallback logic:
  // Try a few likely paths so the logo works whether it's in docs/assets or assets.
  const logoRef = useRef(null);
  const logoCandidatePaths = [
    "/pilani-trails/assets/logo.jpg",    // typical Vite-built path when base='/pilani-trails/'
    "/pilani-trails/docs/assets/logo.jpg",
    "/docs/assets/logo.jpg",
    "/assets/logo.jpg",
    "/docs/logo.jpg",
    "/logo.jpg",
  ];
  let candidateIndex = 0;
  const onLogoError = (e) => {
    candidateIndex += 1;
    const next = logoCandidatePaths[candidateIndex];
    if (next) {
      e.target.src = next;
    } else {
      // last fallback: hide image and show text fallback
      e.target.style.display = "none";
      const fallback = document.createElement("span");
      fallback.textContent = "Pilani Trails";
      fallback.className = "brand-text-fallback";
      e.target.parentNode && e.target.parentNode.appendChild(fallback);
    }
  };

  return (
    <header className="app-header">
      <nav className="header-nav">
        {/* Brand */}
        <div className="nav-brand">
          <Link
            to="/"
            className="brand-link"
            onClick={() => setMenuOpen(false)}
            aria-label="Pilani Trails home"
          >
            <img
              ref={logoRef}
              src={logoCandidatePaths[0]}
              alt="Pilani Trails"
              className="brand-logo"
              onError={onLogoError}
            />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Links */}
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

              {/* admin-only links */}
              {isAdmin && (
                <>
                  <li>
                    <Link to="/admin/review" onClick={() => setMenuOpen(false)}>Admin Review</Link>
                  </li>
                  <li>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                  </li>
                </>
              )}

              <li>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
