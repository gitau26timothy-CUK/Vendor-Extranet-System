import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  loginUser: (credentials) => api.post('/auth/login/user', credentials),
  loginVendor: (credentials) => api.post('/auth/login/vendor', credentials),
  registerUser: (data) => api.post('/auth/register/user', data),
  registerVendor: (data) => api.post('/auth/register/vendor', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Vendor API
export const vendorAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  approve: (id) => api.post(`/vendors/${id}/approve`),
  reject: (id, reason) => api.post(`/vendors/${id}/reject`, { reason }),
  suspend: (id, reason) => api.post(`/vendors/${id}/suspend`, { reason }),
  getProfile: () => api.get('/vendors/profile/me'),
  updateProfile: (data) => api.put('/vendors/profile/me', data),
  uploadDocument: (formData) => api.post('/vendors/profile/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPerformance: (id) => api.get(`/vendors/${id}/performance`),
};

// Order API
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  approve: (id) => api.post(`/orders/${id}/approve`),
  getVendorOrders: () => api.get('/orders/vendor/my-orders'),
  acknowledge: (id) => api.post(`/orders/${id}/acknowledge`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile/me', data),
  changePassword: (data) => api.put('/users/profile/password', data),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getVendorAnalytics: (params) => api.get('/analytics/vendors', { params }),
  getOrderAnalytics: (params) => api.get('/analytics/orders', { params }),
  getPerformanceMetrics: (params) => api.get('/analytics/performance', { params }),
  getSpendAnalysis: (params) => api.get('/analytics/spend', { params }),
  generateReport: (data) => api.post('/analytics/reports', data),
  exportData: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};

// AI API
export const aiAPI = {
  analyzeVendor: (id) => api.post(`/ai/analyze-vendor/${id}`),
  matchVendors: (requirements) => api.post('/ai/match-vendors', { requirements }),
  predictDelivery: (orderId) => api.post(`/ai/predict-delivery/${orderId}`),
  generateInsights: (data) => api.post('/ai/analytics-insights', { data }),
  batchAnalyzeVendors: () => api.post('/ai/batch-analyze-vendors'),
};

export default api;

// Made with Bob
