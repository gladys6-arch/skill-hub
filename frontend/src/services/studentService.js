import axios from "axios";
import { API_BASE_URL } from "../api";

export const getCourses = () => axios.get(`${API_BASE_URL}/student/courses`);
