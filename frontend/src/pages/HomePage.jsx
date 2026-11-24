import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import LiveStatsBanner from '../components/LiveStatsBanner';
import ServicesSection from '../components/ServicesSection';
import FleetShowcaseSection from '../components/FleetShowcaseSection';
import PopularRoutesSection from '../components/PopularRoutesSection';
import WhyChooseUs from '../components/WhyChooseUs';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import LiveActivityToast from '../components/LiveActivityToast';
import SEOHead from '../components/SEOHead';
import CookieConsent from '../components/CookieConsent';
import { trackPageView, trackModalOpen } from '../utils/analytics';

// Lazy-loaded modal to cut 70KB+ from initial critical mobile JavaScript bundle
const BookingModal = React.lazy(() => import('../components/BookingModal'));

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Preload heavy BookingModal chunk during browser idle time for 0ms interaction latency
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => import('../components/BookingModal'));
      } else {
        setTimeout(() => import('../components/BookingModal'), 2500);
      }
    }

    trackPageView(location.pathname);
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const handleOpenBooking = (source = 'Homepage') => {
    trackModalOpen(typeof source === 'string' ? source : 'Homepage Button');
    setIsBookingOpen(true);
  };
  const handleCloseBooking = () => setIsBookingOpen(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-taxi-yellow selection:text-black">
      {/* Dynamic SEO Head Management */}
      <SEOHead />

      {/* Navigation */}
      <Navbar onOpenBooking={handleOpenBooking} />

      <main id="main-content">
        {/* Hero Slider with 'One Click Book Your Ride' CTA */}
        <HeroSlider onOpenBooking={handleOpenBooking} />

        {/* Live Dispatch Statistics & Active Radar Counter */}
        <LiveStatsBanner onOpenBooking={handleOpenBooking} />

        {/* Services Section */}
        <ServicesSection onOpenBooking={handleOpenBooking} />

        {/* Interactive Luxury Fleet Showcase */}
        <FleetShowcaseSection onOpenBooking={handleOpenBooking} />

        {/* Popular Routes Section with Animated Highway Route Beams */}
        <PopularRoutesSection onOpenBooking={handleOpenBooking} />

        {/* Why Choose PB08 TAXI Section */}
        <WhyChooseUs onOpenBooking={handleOpenBooking} />

        {/* Verified Customer Reviews & Google Rating Wall of Love */}
        <CustomerReviewsSection onOpenBooking={handleOpenBooking} />

        {/* Frequently Asked Questions Section */}
        <FAQSection onOpenBooking={handleOpenBooking} />

        {/* Contact Section */}
        <ContactSection onOpenBooking={handleOpenBooking} />
      </main>

      {/* Footer */}
      <Footer onOpenBooking={handleOpenBooking} />

      {/* Real-time Live Activity Toast (Social Proof) */}
      <LiveActivityToast onOpenBooking={handleOpenBooking} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp onOpenBooking={handleOpenBooking} />

      {/* Cookie Consent Banner (GDPR / DPDP Compliance) */}
      <CookieConsent />

      {/* One Click Book Your Ride Modal (Lazy Loaded & Isolated Chunk) */}
      {isBookingOpen && (
        <React.Suspense fallback={null}>
          <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
        </React.Suspense>
      )}
    </div>
  );
}
