import axios from "axios";
import { API_BASE_URL } from "../api";

export const getAllUsers = () => axios.get(`${API_BASE_URL}/api/admin/users`);
export const deleteUser = (id) => axios.delete(`${API_BASE_URL}/api/admin/users/${id}`);