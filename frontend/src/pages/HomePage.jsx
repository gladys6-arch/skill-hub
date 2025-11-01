import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="container mt-4">
        <h1>Welcome back, {user.full_name}</h1>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Your Profile</h5>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Full Name:</strong> {user.full_name}</p>
            {user.role === 'teacher' && (
              <div className="mt-3">
                <Link to="/teacher" className="btn btn-primary me-2">Go to Teacher Dashboard</Link>
              </div>
            )}
            {user.role === 'student' && (
              <div className="mt-3">
                <Link to="/student" className="btn btn-primary me-2">Go to Student Dashboard</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>Welcome to Skill Hub</h1>
      <p>A platform for connecting learners and teachers to share skills and knowledge.</p>
      <div className="button-group">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/admin-login">Admin Login</Link>
      </div>
    </div>
  );
}

export default HomePage;
