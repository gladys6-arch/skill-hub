import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  return (
    <div className="container mt-4">
      <h2>Student Dashboard</h2>
      <Link to="/student/courses">Available Courses</Link><br/>
      <Link to="/student/progress">Progress</Link><br/>
      <Link to="/student/certificate">Certificates</Link>
    </div>
  );
}
