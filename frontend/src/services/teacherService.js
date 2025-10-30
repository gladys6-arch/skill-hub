import axios from "axios";
import { API_BASE_URL } from "../api";

export const addSkill = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}/api/teacher/add-skill`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

