import axios from 'axios';

// TODO: Replace with your actual Render backend URL after deployment
const productionUrl = 'https://YOUR-RENDER-APP-NAME.onrender.com/api';
const developmentUrl = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? productionUrl : developmentUrl,
  withCredentials: true, // Important for cookies
});

export default api;
