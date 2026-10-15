import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb08_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('pb08_admin_token');
        localStorage.removeItem('pb08_admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Public APIs
export const fetchPublicSliders = () => api.get('/api/slider-images').then(r => r.data);
export const createBooking = (payload) => api.post('/api/bookings', payload).then(r => r.data);

// Admin Auth APIs
export const adminLogin = (username, password) => 
  api.post('/api/admin/login', { username, password }).then(r => r.data);
export const getAdminMe = () => api.get('/api/admin/me').then(r => r.data);

// Admin Dashboard & Customers
export const getAdminStats = () => api.get('/api/admin/stats').then(r => r.data);
export const getCustomers = (q = '') => api.get(`/api/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(r => r.data);
export const createCustomer = (data) => api.post('/api/admin/customers', data).then(r => r.data);
export const updateCustomer = (id, data) => api.put(`/api/admin/customers/${id}`, data).then(r => r.data);
export const deleteCustomer = (id) => api.delete(`/api/admin/customers/${id}`).then(r => r.data);
export const updateCustomerConsent = (id, consent) => 
  api.patch(`/api/admin/customers/${id}/consent?marketing_consent=${consent}`).then(r => r.data);

// Admin Drivers
export const getDrivers = (status = '') => {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status_filter', status);
  return api.get(`/api/admin/drivers?${params.toString()}`).then(r => r.data);
};
export const createDriver = (data) => api.post('/api/admin/drivers', data).then(r => r.data);
export const updateDriver = (id, data) => api.put(`/api/admin/drivers/${id}`, data).then(r => r.data);
export const deleteDriver = (id) => api.delete(`/api/admin/drivers/${id}`).then(r => r.data);
export const toggleDriverActive = (id) => api.patch(`/api/admin/drivers/${id}/toggle-active`).then(r => r.data);

// Fleet Cars Management
export const getPublicFleetCars = () => api.get('/api/fleet-cars').then(r => r.data);
export const getFleetCars = () => api.get('/api/admin/drivers/cars').then(r => r.data);
export const createFleetCar = (data) => api.post('/api/admin/drivers/cars', data).then(r => r.data);
export const updateFleetCar = (id, data) => api.put(`/api/admin/drivers/cars/${id}`, data).then(r => r.data);
export const deleteFleetCar = (id) => api.delete(`/api/admin/drivers/cars/${id}`).then(r => r.data);

// Admin Bookings
export const getBookings = (status = '', q = '') => {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status_filter', status);
  if (q) params.append('q', q);
  return api.get(`/api/admin/bookings?${params.toString()}`).then(r => r.data);
};
export const updateBookingStatus = (id, status, notes = '', driverId = null, sendWhatsApp = true) => 
  api.patch(`/api/admin/bookings/${id}/status`, { 
    status, 
    notes, 
    driver_id: driverId, 
    send_whatsapp: sendWhatsApp 
  }).then(r => r.data);

// Admin Slider
export const getAdminSliders = () => api.get('/api/admin/slider-images').then(r => r.data);
export const createSlider = (data) => api.post('/api/admin/slider-images', data).then(r => r.data);
export const updateSlider = (id, data) => api.put(`/api/admin/slider-images/${id}`, data).then(r => r.data);
export const deleteSlider = (id) => api.delete(`/api/admin/slider-images/${id}`).then(r => r.data);
export const uploadSliderImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/admin/slider-images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

// Admin WhatsApp Settings & Offers
export const getWhatsAppStatus = () => api.get('/api/admin/whatsapp/status').then(r => r.data);
export const connectWhatsApp = () => api.post('/api/admin/whatsapp/connect').then(r => r.data);
export const refreshWhatsAppQR = () => api.post('/api/admin/whatsapp/refresh-qr').then(r => r.data);
export const getWhatsAppQR = () => api.get('/api/admin/whatsapp/qr').then(r => r.data);
export const disconnectWhatsApp = () => api.post('/api/admin/whatsapp/disconnect').then(r => r.data);
export const logoutWhatsApp = () => api.post('/api/admin/whatsapp/logout').then(r => r.data);
export const getWhatsAppAdminSettings = () => api.get('/api/admin/whatsapp/settings').then(r => r.data);
export const updateWhatsAppAdminSettings = (payload) => api.post('/api/admin/whatsapp/settings', payload).then(r => r.data);
export const sendTestMessage = (phone, message) => 
  api.post('/api/admin/whatsapp/test-message', { phone, message }).then(r => r.data);
export const sendDirectChatMessage = (payload) => 
  api.post('/api/admin/whatsapp/chat/send', payload).then(r => r.data);
export const getDirectChatHistory = (phone) => {
  const params = new URLSearchParams({ phone });
  return api.get(`/api/admin/whatsapp/chat/history?${params.toString()}`).then(r => r.data);
};
export const getEligibleOffersCount = () => api.get('/api/admin/whatsapp/offers/eligible-count').then(r => r.data);
export const sendPromotionalOffer = (message) => 
  api.post('/api/admin/whatsapp/offers/send', { message }).then(r => r.data);
export const getWhatsAppLogs = (limit = 50, type = '') => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (type) params.append('message_type', type);
  return api.get(`/api/admin/whatsapp/logs?${params.toString()}`).then(r => r.data);
};

// WhatsApp Message Templates
export const getMessageTemplates = () => api.get('/api/admin/whatsapp/templates').then(r => r.data);
export const updateMessageTemplate = (templateKey, content) => 
  api.put(`/api/admin/whatsapp/templates/${templateKey}`, { content }).then(r => r.data);
export const resetMessageTemplates = () => api.post('/api/admin/whatsapp/templates/reset').then(r => r.data);

// Site Settings & Admin Credentials
export const getPublicSiteSettings = () => api.get('/api/site-settings').then(r => r.data);
export const getAdminSettings = () => api.get('/api/admin/settings').then(r => r.data);
export const updateAdminSettings = (payload) => api.post('/api/admin/settings', payload).then(r => r.data);
export const uploadSiteAsset = (file, assetType = 'logo') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('asset_type', assetType);
  return api.post('/api/admin/settings/upload-asset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};
export const updateAdminCredentials = (payload) => api.post('/api/admin/settings/credentials', payload).then(r => r.data);
export const factoryResetSystem = (secretPin, options = {}) => 
  api.post('/api/admin/settings/factory-reset', { secret_pin: secretPin, ...options }).then(r => r.data);

// Advance SEO & Omnichannel Injections
export const getPublicSEOSettings = () => api.get('/api/seo').then(r => r.data);
export const getAdminSEOSettings = () => api.get('/api/admin/seo').then(r => r.data);
export const updateAdminSEOSettings = (payload) => api.post('/api/admin/seo', payload).then(r => r.data);
export const resetAdminSEODefaults = () => api.post('/api/admin/seo/reset').then(r => r.data);
export const uploadSEOBanner = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/admin/seo/upload-banner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

// Analytics & Live Visitor Tracker
export const trackVisitorEvent = (payload) => 
  api.post('/api/public/analytics/track', payload).then(r => r.data).catch(() => {});
export const getAdminAnalyticsStats = (days = 7) => 
  api.get(`/api/admin/analytics/stats?days=${days}`).then(r => r.data);
export const getLookerStudioConfig = () => 
  api.get('/api/admin/analytics/looker-studio').then(r => r.data);
export const saveLookerStudioConfig = (embedUrl) => 
  api.post('/api/admin/analytics/looker-studio', { embed_url: embedUrl }).then(r => r.data);

// Google Analytics 4 Data API (Native)
export const getGA4Status = () => 
  api.get('/api/admin/analytics/ga4/status').then(r => r.data);
export const saveGA4Credentials = (serviceAccountJson, propertyId = '411659377') => 
  api.post('/api/admin/analytics/ga4/credentials', { service_account_json: serviceAccountJson, property_id: propertyId }).then(r => r.data);
export const deleteGA4Credentials = () => 
  api.delete('/api/admin/analytics/ga4/credentials').then(r => r.data);
export const getGA4DashboardData = (days = 7) => 
  api.get(`/api/admin/analytics/ga4/data?days=${days}`).then(r => r.data);

export default api;


