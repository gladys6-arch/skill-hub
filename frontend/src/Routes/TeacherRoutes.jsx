import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherDashboard from '../pages/TeacherDashboard';
import AddSkill from '../pages/AddSkill';
import AddCourse from '../pages/AddCourse';
import TeacherCourses from '../pages/TeacherCourses';
import TeacherSkills from '../pages/TeacherSkillS';
import TeacherRequests from '../pages/TeacherRequests';
import TeacherBalance from '../pages/TeacherBalance';
import Modules from '../pages/Modules';
import EditCourse from '../pages/EditCourse';
import Chat from '../pages/Chat';

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="/add-skill" element={<AddSkill />} />
      <Route path="/add-course" element={<AddCourse />} />
      <Route path="/courses" element={<TeacherCourses />} />
      <Route path="/courses/:courseId/edit" element={<EditCourse />} />
      <Route path="/courses/:courseId/modules" element={<Modules />} />
      <Route path="/skills" element={<TeacherSkills />} />
      <Route path="/requests" element={<TeacherRequests />} />
      <Route path="/balance" element={<TeacherBalance />} />
      <Route path="/modules" element={<Modules />} />
      <Route path="/chat/:sessionId" element={<Chat />} />
    </Routes>
  );
}
