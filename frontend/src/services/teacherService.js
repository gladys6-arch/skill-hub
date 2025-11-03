import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000"; // your backend URL

// -------------------- COURSES --------------------
export const getMyCourses = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addCourse = (courseData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/teacher/courses`, courseData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCourse = (courseId, updatedData) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API_BASE_URL}/api/teacher/courses/${courseId}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCourse = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------- MODULES --------------------
export const getCourseModules = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}/modules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addModule = (courseId, moduleData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/teacher/courses/${courseId}/modules`, moduleData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateModule = (moduleId, updatedData) => {
  const token = localStorage.getItem("token");
  return axios.put(
    `${API_BASE_URL}/api/teacher/modules/${moduleId}`,
    updatedData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// -------------------- SKILLS --------------------
export const getMySkills = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/skills`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addSkill = (skillData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/teacher/skills`, skillData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateSkill = (skillId, updatedData) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API_BASE_URL}/api/teacher/skills/${skillId}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------- STUDENTS --------------------
export const getStudentsProgress = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/students-progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCourseStudents = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------- TEACHER REQUESTS --------------------
export const getTeacherRequests = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateRequestStatus = (requestId, statusData) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API_BASE_URL}/api/teacher/requests/${requestId}`, statusData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------- TEACHER BALANCE --------------------
export const getTeacherBalance = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------- TEACHER SUBSCRIPTION --------------------
export const getTeacherSubscription = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/subscription`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------- STUDY SESSIONS --------------------
export const getStudySessions = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------- QUIZ MANAGEMENT --------------------
export const createFinalQuiz = (courseId, quizData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/teacher/courses/${courseId}/final-quiz`, quizData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getFinalQuiz = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}/final-quiz`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const addQuizQuestion = (quizId, questionData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/teacher/quizzes/${quizId}/questions`, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getQuizResults = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}/final-quiz/results`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getTeacherQuizzes = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/quizzes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
