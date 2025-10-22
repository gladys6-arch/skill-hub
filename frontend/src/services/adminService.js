import axios from 'axios'

const API_URL = 'http://localhost:5000/api/admin'

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

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/dashboard')
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/users')
    return response.data
  }
}