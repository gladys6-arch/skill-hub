import axios from "axios";
import { API_BASE_URL } from "../api";

export const getAllUsers = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deleteUser = (id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const registerTeacher = (teacherData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/admin/register-teacher`, teacherData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getTeachers = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/teachers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getStudents = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getDashboardStats = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getTeacherDetails = (id) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/teachers/${id}/details`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getStudentDetails = (id) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/students/${id}/details`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// -------------------- ADMIN REVENUE --------------------
export const getAdminRevenue = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/revenue`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// -------------------- STUDENT PROGRESS TRACKING --------------------
export const getAllStudentProgress = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/student-progress`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getStudentProgressDetail = (studentId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/admin/students/${studentId}/progress`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};