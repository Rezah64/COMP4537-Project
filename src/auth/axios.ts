import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_GATEWAY_URL;

if (!apiUrl) {
  throw new Error("API Gateway URL must be defined in env vars.");
}

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);