import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function HomePage() {
  const { user } = useAuth();
  return (
    <div className="home-container">
      <h1>SkillHub</h1>
      <p>Connect, Learn, and Share Skills with Experts Worldwide</p>

      {!user ? (
        <div className="button-group">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      ) : (
        <div className="dashboard-preview">
          <h3>Welcome back, {user.full_name || user.email}!</h3>
          <p>Access your personalized dashboard to continue your learning journey.</p>

          <div className="role-explanations">
            <div className="role-card">
              <h4>Student Dashboard</h4>
              <p>Enroll in courses, track progress, and interact with teachers.</p>
            </div>
            <div className="role-card">
              <h4>Teacher Dashboard</h4>
              <p>Create courses, manage students, and share your expertise.</p>
            </div>
            <div className="role-card">
              <h4>Admin Dashboard</h4>
              <p>Oversee the platform, manage users, and ensure quality.</p>
            </div>
          </div>

          <p className="role-note">Navigate to your role-specific dashboard using the menu above.</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
