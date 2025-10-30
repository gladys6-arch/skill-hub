import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import ManageUsers from '../pages/ManageUsers';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/manage-users" element={<ManageUsers />} />
    </Routes>
  );
}
