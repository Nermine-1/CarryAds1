import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('profileName');
      localStorage.removeItem('companyName');
      window.location.href = '/login/annonceur';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
