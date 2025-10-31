// Add these to teacherService.js

export const getStudentsProgress = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/students-progress`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getCourseStudents = (courseId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};