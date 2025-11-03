import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherDashboard from '../pages/TeacherDashboard';
import AddSkill from '../pages/AddSkill';
import AddCourse from '../pages/AddCourse';
import AddModule from '../pages/AddModule';
import AddQuiz from '../pages/AddQuiz';
import QuizResults from '../pages/QuizResults';
import TeacherQuizzes from '../pages/TeacherQuizzes';
import TeacherCourses from '../pages/TeacherCourses';
import TeacherSkills from '../pages/TeacherSkills';
import TeacherRequests from '../pages/TeacherRequests';
import TeacherBalance from '../pages/TeacherBalance';
import TeacherSubscription from '../pages/TeacherSubscription';
import Modules from '../pages/Modules';
import EditCourse from '../pages/EditCourse';
import Chat from '../pages/Chat';
import TeacherSessions from '../pages/TeacherSessions';

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="/add-skill" element={<AddSkill />} />
      <Route path="/add-course" element={<AddCourse />} />
      <Route path="/courses/:courseId/add-module" element={<AddModule />} />
      <Route path="/courses/:courseId/add-quiz" element={<AddQuiz />} />
      <Route path="/courses/:courseId/quiz-results" element={<QuizResults />} />
      <Route path="/quizzes" element={<TeacherQuizzes />} />
      <Route path="/courses" element={<TeacherCourses />} />
      <Route path="/courses/:courseId/edit" element={<EditCourse />} />
      <Route path="/courses/:courseId/modules" element={<Modules />} />
      <Route path="/skills" element={<TeacherSkills />} />
      <Route path="/requests" element={<TeacherRequests />} />
      <Route path="/balance" element={<TeacherBalance />} />
      <Route path="/subscription" element={<TeacherSubscription />} />
      <Route path="/modules" element={<Modules />} />
      <Route path="/chat/:sessionId" element={<Chat />} />
      <Route path="/sessions" element={<TeacherSessions />} />
    </Routes>
  );
}
