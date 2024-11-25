import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_GATEWAY_URL;
const frontendUrl = import.meta.env.VITE_FRONTEND_URL

if (!apiUrl || !frontendUrl) {
  throw new Error("Auth url & react app url must be defined in env vars.")
}

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.request.use((config) => {
  config.headers['Origin'] = frontendUrl;
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);