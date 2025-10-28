import axios from 'axios';

const API = "http://localhost:5000/admin";

export const getAllUsers = () => axios.get(`${API}/users`);
export const deleteUser = (id) => axios.delete(`${API}/users/${id}`);
