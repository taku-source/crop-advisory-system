import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers      = (params) => api.get('/users', { params });
export const getUser       = (id)     => api.get(`/users/${id}`);
export const updateUser    = (id, d)  => api.put(`/users/${id}`, d);
export const suspendUser   = (id)     => api.put(`/users/${id}/suspend`);
export const activateUser  = (id)     => api.put(`/users/${id}/activate`);

// ── Advisories ────────────────────────────────────────────────────────────────
export const getAdvisories    = (p)    => api.get('/advisories', { params: p });
export const createAdvisory   = (d)    => api.post('/advisories', d);
export const updateAdvisory   = (id,d) => api.put(`/advisories/${id}`, d);
export const deleteAdvisory   = (id)   => api.delete(`/advisories/${id}`);
export const getContextualAdvisories = () => api.get('/advisories-contextual/farmer');
export const getFarmerWeather = (farmerId) => api.get(`/advisories-contextual/weather/${farmerId}`);
export const getFarmerClimate = (farmerId) => api.get(`/advisories-contextual/climate/${farmerId}`);

// ── Diseases ──────────────────────────────────────────────────────────────────
export const getDiseases    = (p)    => api.get('/diseases', { params: p });
export const createDisease  = (d)    => api.post('/diseases', d);
export const updateDisease  = (id,d) => api.put(`/diseases/${id}`, d);
export const deleteDisease  = (id)   => api.delete(`/diseases/${id}`);
export const identifyDisease = (data) => api.post('/diseases/identify', data);
export const matchSymptoms = (data) => api.post('/diseases-symptom-match/match-symptoms', data);
export const getCropSymptoms = (crop) => api.get(`/diseases-symptom-match/symptoms/${crop}`);

// ── Records ───────────────────────────────────────────────────────────────────
export const getRecords      = (params) => api.get('/records', { params });
export const getRecordSummary= () => api.get('/records/summary');
export const createRecord    = (data) => api.post('/records', data);
export const updateRecord    = (id, data) => api.put(`/records/${id}`, data);
export const deleteRecord    = (id) => api.delete(`/records/${id}`);

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications   = ()    => api.get('/notifications');
export const createNotification = (d)   => api.post('/notifications', d);
export const deleteNotification = (id)  => api.delete(`/notifications/${id}`);

// ── Reports ───────────────────────────────────────────────────────────────────
export const getAdminReport = () => api.get('/reports/admin');

// ── Knowledge ─────────────────────────────────────────────────────────────────
export const getKnowledge    = (p)    => api.get('/knowledge', { params: p });
export const createKnowledge = (d)    => api.post('/knowledge', d);
export const updateKnowledge = (id,d) => api.put(`/knowledge/${id}`, d);
export const deleteKnowledge = (id)   => api.delete(`/knowledge/${id}`);

export default api;
