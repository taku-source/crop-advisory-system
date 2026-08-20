import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set EXPO_PUBLIC_API_URL in mobile-app/.env for a physical device or deployment.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register   = (data)     => api.post('/auth/register', data);
export const login      = (data)     => api.post('/auth/login', data);
export const getMe      = ()         => api.get('/auth/me');
export const updateProfile = (data)  => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/change-password', data);

// ─── Advisories ───────────────────────────────────────────────────────────────
export const getAdvisories = (params) => api.get('/advisories', { params });
export const getAdvisory   = (id)     => api.get(`/advisories/${id}`);
export const getSeasonalPlan = () => api.get('/advisories-contextual/seasonal-plan');

// First-login crop selection
export const getAvailableCrops = () => api.get('/crop-selection/available-crops');
export const getCropInfo = (crop) => api.get(`/crop-selection/crop-info/${encodeURIComponent(crop)}`);
export const selectCrop = (cropNames) => api.post('/crop-selection/select-crop', { cropNames: Array.isArray(cropNames) ? cropNames : [cropNames] });

// ─── Disease Identification ───────────────────────────────────────────────────
export const getDiseases     = (params) => api.get('/diseases', { params });
export const identifyDisease = (data)   => api.post('/diseases/identify', data);
export const getDisease      = (id)     => api.get(`/diseases/${id}`);

// ─── Farm Records ─────────────────────────────────────────────────────────────
export const getRecords     = (params)      => api.get('/records', { params });
export const getRecord      = (id)          => api.get(`/records/${id}`);
export const getRecordSummary = ()          => api.get('/records/summary');
export const createRecord   = (data)        => api.post('/records', data);
export const updateRecord   = (id, data)    => api.put(`/records/${id}`, data);
export const deleteRecord   = (id)          => api.delete(`/records/${id}`);

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = () => api.get('/notifications');

// ─── Knowledge Base ───────────────────────────────────────────────────────────
export const getKnowledge  = (params) => api.get('/knowledge', { params });
export const getArticle    = (id)     => api.get(`/knowledge/${id}`);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const getFarmerReport = () => api.get('/reports/farmer');

export default api;
