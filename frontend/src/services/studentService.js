import axios from 'axios'

const API_URL = 'http://localhost:5000/api/student'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const studentService = {
  getDashboard: async () => {
    const response = await api.get('/dashboard')
    return response.data
  },

  getCourses: async () => {
    const response = await api.get('/courses')
    return response.data
  },

  enroll: async (courseId) => {
    const response = await api.post(`/enroll/${courseId}`)
    return response.data
  },

  updateProgress: async (courseId, progress) => {
    const response = await api.put(`/progress/${courseId}`, { progress })
    return response.data
  }
}