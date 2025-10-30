import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentDashboard from '../pages/StudentDashboard';
import AvailableCourses from '../pages/AvailableCourses';
import Progress from '../pages/Progress';
import Certificate from '../pages/Certificate';
import StudentCourseReviews from '../pages/StudentCourseReviews';
import CourseDetails from '../pages/CourseDetails';

export default function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/courses" element={<AvailableCourses />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/certificate" element={<Certificate />} />
      <Route path="/reviews" element={<StudentCourseReviews />} />
    </Routes>
  );
}