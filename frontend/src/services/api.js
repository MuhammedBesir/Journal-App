import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
};

// Journal services
export const journalService = {
  createEntry: (data) => api.post("/journal", data),
  getEntries: (params) => api.get("/journal", { params }),
  getEntryById: (id) => api.get(`/journal/${id}`),
  getEntryByDate: (date) => api.get(`/journal/date/${date}`),
  updateEntry: (id, data) => api.put(`/journal/${id}`, data),
  deleteEntry: (id) => api.delete(`/journal/${id}`),
  getEntriesDates: (params) => api.get("/journal/dates", { params }),
  getMoodStats: (params) => api.get("/journal/stats/mood", { params }),
};

// Todo services
export const todoService = {
  getTodos: (date = null) => {
    const url = date ? `/todos?date=${date}` : "/todos";
    return api.get(url);
  },
  createTodo: (data) => api.post("/todos", data),
  updateTodo: (id, data) => api.put(`/todos/${id}`, data),
  deleteTodo: (id) => api.delete(`/todos/${id}`),
};

// Analytics services
export const analyticsService = {
  getStreak: () => api.get("/analytics/streak"),
  getWordCloud: (limit = 50) => api.get(`/analytics/word-cloud?limit=${limit}`),
  getWritingFrequency: () => api.get("/analytics/writing-frequency"),
  getMoodTrends: (period = 'month') => api.get(`/analytics/mood-trends?period=${period}`),
  getSummary: () => api.get("/analytics/summary"),
};

// Features services (templates, quotes, badges)
export const featuresService = {
  // Templates
  getTemplates: () => api.get("/features/templates"),
  getTemplateById: (id) => api.get(`/features/templates/${id}`),
  
  // Quotes
  getQuoteOfTheDay: () => api.get("/features/quote"),
  getAllQuotes: () => api.get("/features/quotes"),
  
  // Badges
  getBadges: () => api.get("/features/badges"),
  getBadgeDefinitions: () => api.get("/features/badges/definitions"),
  checkBadges: () => api.post("/features/badges/check"),
};

// Export services
export const exportService = {
  exportMarkdown: (params) => api.get("/export/markdown", { params, responseType: 'blob' }),
  exportJson: () => api.get("/export/json", { responseType: 'blob' }),
  exportText: (params) => api.get("/export/text", { params }),
};

// AI services (Gemini)
export const aiService = {
  analyzeMood: (content, title) => api.post("/ai/analyze-mood", { content, title }),
  getSuggestions: () => api.get("/ai/suggestions"),
  getWeeklySummary: () => api.get("/ai/weekly-summary"),
  getInsights: () => api.get("/ai/insights"),
};

// Media services
export const mediaService = {
  upload: (file, entryId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (entryId) formData.append("entryId", entryId);
    return api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getEntryMedia: (entryId) => api.get(`/media/entry/${entryId}`),
  delete: (id) => api.delete(`/media/${id}`),
};

// Buddy services
export const buddyService = {
  getBuddies: () => api.get("/buddies"),
  getPendingRequests: () => api.get("/buddies/requests"),
  sendRequest: (email) => api.post("/buddies/request", { email }),
  acceptRequest: (requestId) => api.post(`/buddies/accept/${requestId}`),
  declineRequest: (requestId) => api.post(`/buddies/decline/${requestId}`),
  removeBuddy: (buddyId) => api.delete(`/buddies/${buddyId}`),
};

export default api;

