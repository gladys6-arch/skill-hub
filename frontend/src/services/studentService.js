import axios from 'axios';

const API = "http://localhost:5000/student";

export const getCourses = () => axios.get(`${API}/courses`);