import axios from "axios";
import { API_BASE_URL } from "../api";

export const getCourses = () => axios.get(`${API_BASE_URL}/api/student/courses`);

export const enrollInCourse = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/student/enroll`, 
    { course_id: courseId }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const enrollInSkill = (skillId) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/student/enroll-skill`, 
    { skill_id: skillId }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const getCourseDetails = (id) => axios.get(`${API_BASE_URL}/api/student/course/${id}`);
