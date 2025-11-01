import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          SkillHub
        </Link>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          {!user && (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="nav-link">
                Welcome, {user.full_name || user.email}
              </span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </div>

        <div className="menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;