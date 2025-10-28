import axios from 'axios';

const API = "http://localhost:5000/teacher";

export const addSkill = (data) => axios.post(`${API}/add-skill`, data);
