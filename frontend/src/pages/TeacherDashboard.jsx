import React from 'react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  return (
    <div className="container mt-4">
      <h2>Teacher Dashboard</h2>
      <Link to="/teacher/add-skill">Add Skill</Link><br/>
      <Link to="/teacher/modules">Manage Modules</Link>
    </div>
  );
}
