import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Reports API endpoints
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (reportData) => {
    const formData = new FormData();
    Object.keys(reportData).forEach(key => {
      if (key === 'media' && reportData[key]) {
        reportData[key].forEach(file => {
          formData.append('media', file);
        });
      } else {
        formData.append(key, reportData[key]);
      }
    });
    return api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, reportData) => api.put(`/reports/${id}`, reportData),
  delete: (id) => api.delete(`/reports/${id}`),
  validate: (id, validationData) => api.post(`/reports/${id}/validate`, validationData),
  like: (id) => api.post(`/reports/${id}/like`),
  comment: (id, commentData) => api.post(`/reports/${id}/comment`, commentData),
  getMyReports: () => api.get('/users/reports'),
  getByLocation: (lat, lng, radius) => api.get('/reports', { params: { lat, lng, radius } }),
  getByCategory: (category) => api.get('/reports', { params: { category } }),
};

// Dashboard API endpoints
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
  getHeatmap: () => api.get('/dashboard/heatmap'),
  getTrends: (params) => api.get('/dashboard/trends', { params }),
  exportData: (format, params) => api.get('/dashboard/export', { 
    params: { format, ...params },
    responseType: 'blob'
  }),
};

// Gamification API endpoints
export const gamificationAPI = {
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),
  getBadges: () => api.get('/gamification/badges'),
  getProfile: () => api.get('/gamification/profile'),
  getAchievements: () => api.get('/gamification/achievements'),
};

// Community API endpoints
export const communityAPI = {
  getOverview: () => api.get('/community/overview'),
  getResources: (params) => api.get('/community/resources', { params }),
  getEvents: (params) => api.get('/community/events', { params }),
  registerEvent: (eventId) => api.post(`/community/events/${eventId}/register`),
  getForums: () => api.get('/community/forums'),
  getForumTopics: (forumId) => api.get(`/community/forums/${forumId}/topics`),
  getPartners: () => api.get('/community/partners'),
};

// Users API endpoints
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  getMyReports: () => api.get('/users/reports'),
  getStatistics: () => api.get('/users/statistics'),
  getPublicProfile: (userId) => api.get(`/users/${userId}`),
  getPublicReports: (userId) => api.get(`/users/${userId}/reports`),
  deactivateAccount: () => api.delete('/users/profile'),
};

// Admin API endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllReports: (params) => api.get('/admin/reports', { params }),
  updateReport: (reportId, reportData) => api.put(`/admin/reports/${reportId}`, reportData),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  broadcast: (messageData) => api.post('/admin/broadcast', messageData),
  getSystemStatus: () => api.get('/admin/system-status'),
};

// File upload utility
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Export the main api instance
export default api;
