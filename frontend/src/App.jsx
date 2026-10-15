import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';

// Lazy-loaded route components for high performance and lightweight initial mobile bundle
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminCustomersPage = lazy(() => import('./pages/AdminCustomersPage'));
const AdminBookingsPage = lazy(() => import('./pages/AdminBookingsPage'));
const AdminDriversPage = lazy(() => import('./pages/AdminDriversPage'));
const AdminSliderPage = lazy(() => import('./pages/AdminSliderPage'));
const AdminWhatsAppPage = lazy(() => import('./pages/AdminWhatsAppPage'));
const AdminOffersPage = lazy(() => import('./pages/AdminOffersPage'));
const AdminLogsPage = lazy(() => import('./pages/AdminLogsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminSEOPage = lazy(() => import('./pages/AdminSEOPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PopularRoutesPage = lazy(() => import('./pages/PopularRoutesPage'));
const SafeTravelGuidelinesPage = lazy(() => import('./pages/SafeTravelGuidelinesPage'));
const EditorialPolicyPage = lazy(() => import('./pages/EditorialPolicyPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-taxi-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-taxi-yellow border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Taxi Homepage */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/about-us" element={<Navigate to="/about" replace />} />
        <Route path="/contact" element={<HomePage />} />
        <Route path="/contact-us" element={<Navigate to="/contact" replace />} />

        {/* Popular Routes Across India SEO Landing Page */}
        <Route path="/popular-routes" element={<PopularRoutesPage />} />
        <Route path="/routes" element={<Navigate to="/popular-routes" replace />} />

        {/* Legal, Safety & Trust Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
        <Route path="/safe-travel-guidelines" element={<SafeTravelGuidelinesPage />} />
        <Route path="/safety" element={<Navigate to="/safe-travel-guidelines" replace />} />
        <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
        <Route path="/editorial" element={<Navigate to="/editorial-policy" replace />} />

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
          <Route path="analytics" element={<AdminAnalyticsPage />} />
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
    </Suspense>
  );
}
