import axios from "axios";
import { API_BASE_URL } from "../api";

export const addSkill = (data) =>
  axios.post(`${API_BASE_URL}/teacher/add-skill`, data);
