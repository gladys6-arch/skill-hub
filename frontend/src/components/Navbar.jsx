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
        {/* <div className="logo">SkillHub</div> */}

        {/* Mobile menu toggle */}
        <button className="menu-toggle" onClick={toggleMenu} style={{ display: 'none', background: 'none', border: 'none', color: '#FFFFFF', fontSize: '24px', cursor: 'pointer' }}>
          ☰
        </button>

        {user ? (
          <>
            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="nav-link">Dashboard</Link>
                  <Link to="/admin/manage-users" className="nav-link">Total Users</Link>
                  {/* <Link to="/admin/manage-users" className="nav-link">Total Students</Link> */}
                  <Link to="/admin/revenue" className="nav-link">Platform Revenue</Link>
                </>
              )}
              {user.role === 'teacher' && (
                <div className="teacher-nav" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link to="/teacher" className="nav-link">Student Progress</Link>
                  <Link to="/teacher/add-skill" className="nav-link">Add Skill</Link>
                  <Link to="/teacher/add-course" className="nav-link">Add Course</Link>
                  <Link to="/teacher/courses" className="nav-link">My Courses</Link>
                  <Link to="/teacher/balance" className="nav-link">Balance</Link>
                  <Link to="/teacher/subscription" className="nav-link">Subscription</Link>
                  <Link to="/teacher/sessions" className="nav-link">Chat Sessions</Link>
                  <Link to="/teacher/requests" className="nav-link" style={{ background: 'rgba(199,167,110,0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(199,167,110,0.3)' }}>Requests</Link>
                </div>
              )}
              {user.role === 'student' && (
                <>
                  <Link to="/student/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/student/courses" className="nav-link">Available Courses</Link>
                </>
              )}
              <span className="nav-link" style={{ background: 'rgba(199,167,110,0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(199,167,110,0.3)', fontWeight: '600', color: '#C7A76E' }}>Welcome, {user.full_name || user.email}</span>
              <button onClick={handleLogout} className="logout-btn site-button">Logout</button>
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