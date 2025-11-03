import axios from "axios";
import { API_BASE_URL } from "../api";

export const login = (data) => axios.post(`${API_BASE_URL}/api/auth/login`, data);
export const register = (data) =>
  axios.post(`${API_BASE_URL}/api/auth/register`, data);
