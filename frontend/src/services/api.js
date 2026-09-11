import axios from 'axios';
import toast from 'react-hot-toast';

// In development, Vite proxy forwards /api to http://localhost:8080/api
// In production on Netlify, VITE_API_BASE_URL points to Railway backend (e.g. https://xyz.up.railway.app)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1`
    : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ballpen_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data and handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('ballpen_token');
      localStorage.removeItem('ballpen_user');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('Access Denied: You do not have permission for this action.');
    } else if (status >= 500) {
      toast.error(message || 'Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;
