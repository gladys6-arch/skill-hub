import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="container section" style={{ marginTop: '200px', textAlign: 'center' }}>
        <h1 className="hero-title">Welcome back, {user.full_name}</h1>
        <div className="card glass-box" style={{ maxWidth: '600px', margin: '40px auto' }}>
          <div className="card-body">
            <h5 className="card-title lux-accent">Your Profile</h5>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Full Name:</strong> {user.full_name}</p>
            {user.role === 'teacher' && (
              <div className="mt-3">
                <Link to="/teacher" className="site-button me-2">Go to Teacher Dashboard</Link>
              </div>
            )}
            {user.role === 'student' && (
              <div className="mt-3">
                <Link to="/student" className="site-button me-2">Go to Student Dashboard</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ marginTop: '200px', textAlign: 'center' }}>
      <h1 className="hero-title">Welcome to Skill Hub</h1>
      <p className="lux-accent" style={{ fontSize: '18px', marginBottom: '40px' }}>A platform for connecting learners and teachers to share skills and knowledge.</p>
      <div className="button-group" style={{ justifyContent: 'center' }}>
        <Link to="/login" className="site-button">Login</Link>
        <Link to="/register" className="site-button">Register</Link>
        <Link to="/admin-login" className="ghost-btn">Admin Login</Link>
      </div>
    </div>
  );
}

export default HomePage;
