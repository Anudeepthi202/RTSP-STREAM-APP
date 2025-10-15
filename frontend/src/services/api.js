import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Overlay API calls
export const overlayAPI = {
  // Get all overlays
  getAll: () => api.get('/overlays'),
  
  // Get single overlay
  get: (id) => api.get(`/overlays/${id}`),
  
  // Create new overlay
  create: (overlayData) => api.post('/overlays', overlayData),
  
  // Update overlay
  update: (id, overlayData) => api.put(`/overlays/${id}`, overlayData),
  
  // Delete overlay
  delete: (id) => api.delete(`/overlays/${id}`),
};

// Stream settings API calls
export const streamAPI = {
  // Get stream settings
  getSettings: () => api.get('/stream/settings'),
  
  // Save stream settings
  saveSettings: (settings) => api.post('/stream/settings', settings),
  
  // ✅ ADD THESE NEW FUNCTIONS:
  // Start RTSP stream
  startStream: (rtspUrl) => api.post('/stream/start', { rtsp_url: rtspUrl }),
  
  // Stop RTSP stream
  stopStream: () => api.post('/stream/stop'),
  
  // Get stream status
  getStreamStatus: () => api.get('/stream/status')
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;