import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

// Token Management
let authToken = localStorage.getItem('authToken');

API.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

export const clearToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

export default API;
