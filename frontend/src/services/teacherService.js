import axios from "axios";
import { API_BASE_URL } from "../api";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const addSkill = (data) => {
  return axios.post(`${API_BASE_URL}/api/teacher/add-skill`, data, getAuthHeaders());
};

export const getMySkills = () => {
  return axios.get(`${API_BASE_URL}/api/teacher/skills`, getAuthHeaders());
};

export const getMyCourses = () => {
  return axios.get(`${API_BASE_URL}/api/teacher/courses`, getAuthHeaders());
};

export const addCourse = (data) => {
  return axios.post(`${API_BASE_URL}/api/teacher/courses`, data, getAuthHeaders());
};

export const addModule = (courseId, data) => {
  return axios.post(`${API_BASE_URL}/api/teacher/courses/${courseId}/modules`, data, getAuthHeaders());
};

export const getCourseModules = (courseId) => {
  return axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}/modules`, getAuthHeaders());
};

export const getTeacherRequests = () => {
  return axios.get(`${API_BASE_URL}/api/teacher/requests`, getAuthHeaders());
};

export const updateRequestStatus = (requestId, status) => {
  return axios.put(`${API_BASE_URL}/api/teacher/requests/${requestId}`, { status }, getAuthHeaders());
};

