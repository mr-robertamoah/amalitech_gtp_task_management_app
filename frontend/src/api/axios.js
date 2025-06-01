import axios from 'axios';
import { store } from '../app/store';

const backendBaseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: backendBaseURL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include access token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
