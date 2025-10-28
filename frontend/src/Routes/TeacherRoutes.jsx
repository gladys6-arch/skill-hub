import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherDashboard from '../pages/TeacherDashboard';
import AddSkill from '../pages/AddSkill';
import Modules from '../pages/Modules';

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="/add-skill" element={<AddSkill />} />
      <Route path="/modules" element={<Modules />} />
    </Routes>
  );
}
