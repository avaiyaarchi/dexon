import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject the JWT token automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('dexon_admin_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired, clear it and redirect to login
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dexon_admin_token');
        localStorage.removeItem('dexon_admin_user');
        // Do not redirect on active login pages to avoid loops
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
