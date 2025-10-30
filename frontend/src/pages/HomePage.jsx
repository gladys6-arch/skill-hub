import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to Skill Hub</h1>
      <p>A platform for connecting learners and teachers to share skills and knowledge.</p>
      <div className="button-group">
        <Link to="/login" className="btn">Login</Link>
        <Link to="/register" className="btn">Register</Link>
      </div>
    </div>
  );
}

export default HomePage;
