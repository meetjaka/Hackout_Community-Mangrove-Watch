import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5003/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle rate limiting with retry mechanism
    if (error.response?.status === 429) {
      console.warn(
        "⚠️ Rate limit exceeded. Please wait before making more requests."
      );

      // Show user-friendly message with retry information
      if (typeof window !== "undefined" && window.toast) {
        const retryAfter = error.response.headers["retry-after"];
        const message = retryAfter 
          ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
          : "Too many requests. Please wait a moment and try again.";
        
        window.toast.error(message);
      }

      // Add retry-after header support if available
      const retryAfter = error.response.headers["retry-after"];
      if (retryAfter) {
        console.log(
          `⏰ Server suggests waiting ${retryAfter} seconds before retrying.`
        );
      }

      // Log rate limit headers for debugging
      console.log("Rate limit headers:", {
        "X-RateLimit-Limit": error.response.headers["x-ratelimit-limit"],
        "X-RateLimit-Remaining": error.response.headers["x-ratelimit-remaining"],
        "X-RateLimit-Reset": error.response.headers["x-ratelimit-reset"],
        "Retry-After": error.response.headers["retry-after"]
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn("⚠️ Authentication failed. Token may be expired.");

      // Clear token and redirect to login if it's an auth error
      localStorage.removeItem("token");

      // Only redirect if we're not already on login/register pages
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to retry requests with exponential backoff
export const retryRequest = async (
  requestFn,
  maxRetries = 3,
  baseDelay = 1000
) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(
          `⏰ Rate limited. Waiting ${delay}ms before retry ${
            attempt + 1
          }/${maxRetries}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) => api.put("/auth/password", passwordData),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post("/auth/refresh-token"),
};

// Reports API endpoints
export const reportsAPI = {
  getAll: (params) => api.get("/reports", { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (reportData) => {
    return api.post("/reports", reportData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, reportData) => api.put(`/reports/${id}`, reportData),
  delete: (id) => api.delete(`/reports/${id}`),
  validate: (id, validationData) =>
    api.post(`/reports/${id}/validate`, validationData),
  like: (id) => api.post(`/reports/${id}/like`),
  comment: (id, commentData) => api.post(`/reports/${id}/comment`, commentData),
  getMyReports: () => api.get("/users/reports"),
  getByLocation: (lat, lng, radius) =>
    api.get("/reports", { params: { lat, lng, radius } }),
  getByCategory: (category) => api.get("/reports", { params: { category } }),
};

// Dashboard API endpoints
export const dashboardAPI = {
  getOverview: () => api.get("/dashboard/overview"),
  getAnalytics: (params) => api.get("/dashboard/analytics", { params }),
  getHeatmap: () => api.get("/dashboard/heatmap"),
  getTrends: (params) => api.get("/dashboard/trends", { params }),
  exportData: (format, params) =>
    api.get("/dashboard/export", {
      params: { format, ...params },
      responseType: "blob",
    }),
};

// Gamification API endpoints
export const gamificationAPI = {
  getLeaderboard: (params) => api.get("/gamification/leaderboard", { params }),
  getBadges: () => api.get("/gamification/badges"),
  getProfile: () => api.get("/gamification/profile"),
  getAchievements: () => api.get("/gamification/achievements"),
};

// Community API endpoints
export const communityAPI = {
  getOverview: () => api.get("/community/overview"),
  getResources: (params) => api.get("/community/resources", { params }),
  getGuidelines: () => api.get("/community/guidelines"),
  getEvents: (params) => api.get("/community/events", { params }),
  getEventDetails: (eventId) => api.get(`/community/events/${eventId}`),
  registerEvent: (eventId, data) => api.post(`/community/events/${eventId}/register`, data),
  unregisterEvent: (eventId) => api.post(`/community/events/${eventId}/unregister`),
  getEventParticipants: (eventId) => api.get(`/community/events/${eventId}/participants`),
  getForums: () => api.get("/community/forums"),
  getForumTopics: (forumId) => api.get(`/community/forums/${forumId}/topics`),
  getPartners: (params) => api.get("/community/partners", { params }),
  likeResource: (resourceId) => api.post(`/community/resources/${resourceId}/like`),
  favoriteResource: (resourceId) => api.post(`/community/resources/${resourceId}/favorite`),
  getResourceInteractions: (resourceId) => api.get(`/community/resources/${resourceId}/interactions`),
  getUserFavorites: () => api.get("/community/user/favorites"),
  shareResource: (resourceId, data) => api.post(`/community/resources/${resourceId}/share`, data),
  
  // Community Management
  createCommunity: (communityData) => api.post("/community/create", communityData),
  joinCommunity: (communityId) => api.post(`/community/${communityId}/join`),
  leaveCommunity: (communityId) => api.post(`/community/${communityId}/leave`),
  getMyCommunities: () => api.get("/community/my-communities"),
  discoverCommunities: (params) => api.get("/community/discover", { params }),
};

// Users API endpoints
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (profileData) => api.put("/users/profile", profileData),
  changePassword: (passwordData) => api.put("/users/password", passwordData),
  getMyReports: () => api.get("/users/reports"),
  getStatistics: () => api.get("/users/statistics"),
  getPublicProfile: (userId) => api.get(`/users/${userId}`),
  getPublicReports: (userId) => api.get(`/users/${userId}/reports`),
  deactivateAccount: () => api.delete("/users/profile"),
};

// Admin API endpoints
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getAllUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllReports: (params) => api.get("/admin/reports", { params }),
  updateReport: (reportId, reportData) =>
    api.put(`/admin/reports/${reportId}`, reportData),
  getAnalytics: (params) => api.get("/admin/analytics", { params }),
  broadcast: (messageData) => api.post("/admin/broadcast", messageData),
  getSystemStatus: () => api.get("/admin/system-status"),
  
  // Community Management
  getCommunityContent: () => api.get("/admin/community/content"),
  getCommunityList: () => api.get("/admin/community/list"),
  createCommunity: (communityData) => api.post("/admin/community", communityData),
  updateCommunity: (communityId, communityData) => api.put(`/admin/community/${communityId}`, communityData),
  deleteCommunity: (communityId) => api.delete(`/admin/community/${communityId}`),
  addResource: (resourceData) => api.post("/admin/community/resources", resourceData),
  updateResource: (resourceId, resourceData) => api.put(`/admin/community/resources/${resourceId}`, resourceData),
  deleteResource: (resourceId) => api.delete(`/admin/community/resources/${resourceId}`),
  addGuideline: (guidelineData) => api.post("/admin/community/guidelines", guidelineData),
  updateGuideline: (guidelineId, guidelineData) => api.put(`/admin/community/guidelines/${guidelineId}`, guidelineData),
  deleteGuideline: (guidelineId) => api.delete(`/admin/community/guidelines/${guidelineId}`),
  getCommunityAnalytics: () => api.get("/admin/community/analytics"),
};

// File upload utility
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
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
