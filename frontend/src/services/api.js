import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// History
export const getHistory = (params = {}) => api.get('/api/history/', { params });
export const getHistoryDetail = (id) => api.get(`/api/history/${id}`);
export const deleteHistory = (id) => api.delete(`/api/history/${id}`);
export const clearHistory = () => api.delete('/api/history/');
export const getMriHistory = () => api.get('/predict/mri-history');

// Analytics
export const getAnalyticsSummary = () => api.get('/api/analytics/summary');
export const getRecentPredictions = (limit = 10) => api.get('/api/analytics/recent', { params: { limit } });
export const getPredictionTrends = () => api.get('/api/analytics/trends');

// Heart Prediction
export const predictHeart = (formData) => api.post('/predict-heart-multimodal', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export default api;
