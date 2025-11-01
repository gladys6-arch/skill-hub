import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">SkillHub</div>

        {user ? (
          <>
            <div className="nav-links">
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/admin/users" className="nav-link">Manage Users</Link>
                </>
              )}
              {user.role === 'teacher' && (
                <>
                  <Link to="/teacher/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/teacher/courses" className="nav-link">My Courses</Link>
                </>
              )}
              {user.role === 'student' && (
                <>
                  <Link to="/student/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/student/courses" className="nav-link">Available Courses</Link>
                </>
              )}
              <span className="nav-link">Welcome, {user.full_name || user.email}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </>
        ) : (
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;