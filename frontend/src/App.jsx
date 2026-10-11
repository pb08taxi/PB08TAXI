import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminDriversPage from './pages/AdminDriversPage';
import AdminSliderPage from './pages/AdminSliderPage';
import AdminWhatsAppPage from './pages/AdminWhatsAppPage';
import AdminOffersPage from './pages/AdminOffersPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminSEOPage from './pages/AdminSEOPage';

// Protected Route Component for Admin section
function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('pb08_admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Taxi Homepage */}
      <Route path="/" element={<HomePage />} />

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Protected Routes with Persistent AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="drivers" element={<AdminDriversPage />} />
        <Route path="slider" element={<AdminSliderPage />} />
        <Route path="whatsapp" element={<AdminWhatsAppPage />} />
        <Route path="offers" element={<AdminOffersPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
        <Route path="seo" element={<AdminSEOPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
