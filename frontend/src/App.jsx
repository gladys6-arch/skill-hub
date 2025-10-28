import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext.jsx";

import Navbar from './components/Navbar.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import Home from './pages/HomePage.jsx';

import AdminRoutes from './Routes/AdminRoutes.jsx';
import TeacherRoutes from './Routes/TeacherRoutes.jsx';
import StudentRoutes from './Routes/StudentRoutes.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ padding: "20px" }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-Based Dashboards */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/teacher/*" element={<TeacherRoutes />} />
            <Route path="/student/*" element={<StudentRoutes />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App