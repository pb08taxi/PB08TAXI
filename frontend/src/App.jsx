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
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const JalandharTaxiPage = lazy(() => import('./pages/JalandharTaxiPage'));
const OneWayTaxiPage = lazy(() => import('./pages/OneWayTaxiPage'));
const AirportTaxiPage = lazy(() => import('./pages/AirportTaxiPage'));
const NearMeTaxiPage = lazy(() => import('./pages/NearMeTaxiPage'));

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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about-us" element={<Navigate to="/about" replace />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/contact-us" element={<Navigate to="/contact" replace />} />

        {/* Popular Routes Across India SEO Landing Page */}
        <Route path="/popular-routes" element={<PopularRoutesPage />} />
        <Route path="/routes" element={<Navigate to="/popular-routes" replace />} />

        {/* Dedicated Keyword Silo Landing Pages (Alternative Brand Names & Near Me Searches) */}
        <Route path="/jalandhar-taxi-service" element={<JalandharTaxiPage />} />
        <Route path="/jalandhar-taxi" element={<JalandharTaxiPage />} />
        <Route path="/jalandhar-cab-service" element={<Navigate to="/jalandhar-taxi-service" replace />} />
        <Route path="/taxi-service-jalandhar" element={<Navigate to="/jalandhar-taxi-service" replace />} />

        {/* Near Me Taxi Searches (High Volume Local Mobile Queries) */}
        <Route path="/near-me-taxi-service" element={<NearMeTaxiPage />} />
        <Route path="/near-me-taxi" element={<NearMeTaxiPage />} />
        <Route path="/taxi-near-me" element={<NearMeTaxiPage />} />
        <Route path="/cab-near-me" element={<Navigate to="/near-me-taxi-service" replace />} />
        <Route path="/taxi-service-near-me" element={<Navigate to="/near-me-taxi-service" replace />} />

        <Route path="/one-way-taxi-service" element={<OneWayTaxiPage />} />
        <Route path="/one-way-taxi" element={<Navigate to="/one-way-taxi-service" replace />} />
        <Route path="/one-way-cab" element={<Navigate to="/one-way-taxi-service" replace />} />
        <Route path="/one-way-taxi-jalandhar" element={<Navigate to="/one-way-taxi-service" replace />} />
        <Route path="/one-way-jalandhar" element={<Navigate to="/one-way-taxi-service" replace />} />

        <Route path="/airport-taxi-jalandhar" element={<AirportTaxiPage />} />
        <Route path="/airport-taxi" element={<Navigate to="/airport-taxi-jalandhar" replace />} />
        <Route path="/airport-cabs" element={<Navigate to="/airport-taxi-jalandhar" replace />} />
        <Route path="/delhi-airport-taxi" element={<Navigate to="/airport-taxi-jalandhar" replace />} />

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
