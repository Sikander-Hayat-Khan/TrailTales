import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'https://trailtales.onrender.com/api' : 'http://localhost:5000/api'),
  withCredentials: true, // Important for cookies
});

export default api;
