import axios from 'axios'

const API_URL = 'http://localhost:5000/api/teacher'

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

export const teacherService = {
  getDashboard: async () => {
    const response = await api.get('/dashboard')
    return response.data
  },

  addSkill: async (skillData) => {
    const response = await api.post('/add-skill', skillData)
    return response.data
  },

  addModule: async (courseId, moduleData) => {
    const response = await api.post(`/modules/${courseId}`, moduleData)
    return response.data
  }
}