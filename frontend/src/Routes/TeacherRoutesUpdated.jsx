import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherDashboard from '../pages/TeacherDashboard';
import AddSkill from '../pages/AddSkill';
import AddCourse from '../pages/AddCourse';
import TeacherCourses from '../pages/TeacherCourses';
import TeacherSkills from '../pages/TeacherSkills';
import TeacherRequests from '../pages/TeacherRequests';
import TeacherBalance from '../pages/TeacherBalance';
import StudentProgress from '../pages/StudentProgress';
import Modules from '../pages/Modules';

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="/add-skill" element={<AddSkill />} />
      <Route path="/add-course" element={<AddCourse />} />
      <Route path="/courses" element={<TeacherCourses />} />
      <Route path="/skills" element={<TeacherSkills />} />
      <Route path="/requests" element={<TeacherRequests />} />
      <Route path="/balance" element={<TeacherBalance />} />
      <Route path="/students-progress" element={<StudentProgress />} />
      <Route path="/modules" element={<Modules />} />
    </Routes>
  );
}