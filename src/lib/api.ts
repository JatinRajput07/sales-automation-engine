import axios from 'axios';

// Create a centralized Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Crucial for HttpOnly cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle Unauthorized - Auto logout
      // We will trigger a state reset in our authStore or redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
