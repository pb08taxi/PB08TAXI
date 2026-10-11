import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminSliderPage from './pages/AdminSliderPage';
import AdminWhatsAppPage from './pages/AdminWhatsAppPage';
import AdminOffersPage from './pages/AdminOffersPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

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

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedAdminRoute>
            <AdminCustomersPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedAdminRoute>
            <AdminBookingsPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/slider"
        element={
          <ProtectedAdminRoute>
            <AdminSliderPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/whatsapp"
        element={
          <ProtectedAdminRoute>
            <AdminWhatsAppPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/offers"
        element={
          <ProtectedAdminRoute>
            <AdminOffersPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedAdminRoute>
            <AdminLogsPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedAdminRoute>
            <AdminSettingsPage />
          </ProtectedAdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
