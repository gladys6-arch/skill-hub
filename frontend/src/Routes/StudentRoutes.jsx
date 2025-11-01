import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentDashboard from '../pages/StudentDashboard';
import AvailableCourses from '../pages/AvailableCourses';
import Progress from '../pages/Progress';
import Certificate from '../pages/Certificate';
import StudentCourseReviews from '../pages/StudentCourseReviews';
import CourseDetails from '../pages/CourseDetails';
import CourseContent from '../pages/CourseContent';
import StudentChat from '../pages/StudentChat';
import RequestSession from '../pages/RequestSession';

export default function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/courses" element={<AvailableCourses />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/certificate" element={<Certificate />} />
      <Route path="/reviews" element={<StudentCourseReviews />} />
      <Route path="/course/:courseId/content" element={<CourseContent />} />
      <Route path="/chat/:sessionId" element={<StudentChat />} />
      <Route path="/request-session" element={<RequestSession />} />
    </Routes>
  );
}