import axios from "axios";
import { API_BASE_URL } from "../api";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const getCourses = () => axios.get(`${API_BASE_URL}/api/student/courses`);

export const enrollInCourse = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/student/enroll`,
    { course_id: courseId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const payForCourse = (courseId, phoneNumber) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/payment/payment/pay`,
    { course_id: courseId, phone_number: phoneNumber },
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

export const getEnrolledCourseContent = (courseId) => {
  return axios.get(`${API_BASE_URL}/api/student/enrolled-course/${courseId}`, getAuthHeaders());
};

export const markModuleCompleted = (moduleId, completed) => {
  return axios.post(`${API_BASE_URL}/api/student/modules/${moduleId}/progress`, { completed }, getAuthHeaders());
};

// Time tracking functions
export const startTimeTracking = (moduleId) => {
  return axios.post(`${API_BASE_URL}/api/student/modules/${moduleId}/time/start`, {}, getAuthHeaders());
};

export const updateTimeTracking = (moduleId, additionalSeconds) => {
  return axios.post(`${API_BASE_URL}/api/student/modules/${moduleId}/time/update`, { additional_seconds: additionalSeconds }, getAuthHeaders());
};

export const getTimeTracking = (moduleId) => {
  return axios.get(`${API_BASE_URL}/api/student/modules/${moduleId}/time`, getAuthHeaders());
};

// Reading progress functions
export const getReadingSections = (moduleId) => {
  return axios.get(`${API_BASE_URL}/api/student/modules/${moduleId}/reading-sections`, getAuthHeaders());
};

export const markReadingSectionComplete = (sectionId) => {
  return axios.post(`${API_BASE_URL}/api/student/reading-sections/${sectionId}/complete`, {}, getAuthHeaders());
};

// Quiz functions
export const getModuleQuiz = (moduleId) => {
  return axios.get(`${API_BASE_URL}/api/student/modules/${moduleId}/quiz`, getAuthHeaders());
};

export const startQuizAttempt = (quizId) => {
  return axios.post(`${API_BASE_URL}/api/student/quizzes/${quizId}/start`, {}, getAuthHeaders());
};

export const submitQuizAttempt = (attemptId, responses) => {
  return axios.post(`${API_BASE_URL}/api/student/quiz-attempts/${attemptId}/submit`, { responses }, getAuthHeaders());
};

export const getQuizResults = (attemptId) => {
  return axios.get(`${API_BASE_URL}/api/student/quiz-attempts/${attemptId}/results`, getAuthHeaders());
};

// Final Quiz functions
export const getFinalQuiz = (courseId) => {
  return axios.get(`${API_BASE_URL}/api/student/courses/${courseId}/final-quiz`, getAuthHeaders());
};

export const submitFinalQuizAttempt = (quizId, responses) => {
  return axios.post(`${API_BASE_URL}/api/student/quizzes/${quizId}/submit`, { responses }, getAuthHeaders());
};

// Interactive Elements functions
export const getInteractiveElements = (moduleId) => {
  return axios.get(`${API_BASE_URL}/api/student/modules/${moduleId}/interactive-elements`, getAuthHeaders());
};

export const markInteractiveElementComplete = (elementId) => {
  return axios.post(`${API_BASE_URL}/api/student/interactive-elements/${elementId}/complete`, {}, getAuthHeaders());
};

// Teacher Request functions
export const getMyRequests = () => {
  return axios.get(`${API_BASE_URL}/api/student/my-requests`, getAuthHeaders());
};