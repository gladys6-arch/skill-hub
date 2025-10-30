import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <Link to="/admin/manage-users">Manage Users</Link>
    </div>
  );
}
