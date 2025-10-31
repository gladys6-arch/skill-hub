import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import ManageUsers from '../pages/ManageUsers';
import RegisterTeacher from '../pages/RegisterTeacher';
import TeacherDetails from '../pages/TeacherDetails';
import StudentDetails from '../pages/StudentDetails';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/manage-users" element={<ManageUsers />} />
      <Route path="/register-teacher" element={<RegisterTeacher />} />
      <Route path="/teachers/:id/details" element={<TeacherDetails />} />
      <Route path="/students/:id/details" element={<StudentDetails />} />
    </Routes>
  );
}
