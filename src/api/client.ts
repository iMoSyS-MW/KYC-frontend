import axios from 'axios';
import { getCsrfToken, isTokenExpired } from '../lib/security';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 30000,
  withCredentials: true, // Send cookies (including httpOnly auth cookies) with every request
});

// Request interceptor: attach auth header + CSRF token
client.interceptors.request.use(
  (config) => {
    // 1. Attach Bearer token from localStorage (legacy fallback until backend migrates to httpOnly cookies)
    const token = localStorage.getItem('adminToken');
    if (token && !isTokenExpired(token)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach CSRF token for state-changing methods
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize API envelope + handle 401
client.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success === true) {
        if ('pagination' in response.data) {
          (response as any).pagination = response.data.pagination;
        }
        response.data = response.data.data;
      }
    }
    return response;
  },
  (error) => {
    // Normalize wrapped error envelope
    if (error.response?.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
      const body = error.response.data;
      error.response.data = {
        message: body.message || 'An error occurred',
        ...(body.errors && { errors: body.errors }),
      };
    }

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Redirect to login unless already there
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default client;
