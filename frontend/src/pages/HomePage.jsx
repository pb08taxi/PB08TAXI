import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import ServicesSection from '../components/ServicesSection';
import PopularRoutesSection from '../components/PopularRoutesSection';
import WhyChooseUs from '../components/WhyChooseUs';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import BookingModal from '../components/BookingModal';
import SEOHead from '../components/SEOHead';
import { trackPageView, trackModalOpen } from '../utils/analytics';

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    trackPageView('/');
  }, []);

  // Smooth scroll to anchor if hash is present (e.g. returning from /privacy-policy#routes)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

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

        {/* Services Section */}
        <ServicesSection onOpenBooking={handleOpenBooking} />

        {/* Popular Routes Section (One Way Jalandhar, Delhi, Amritsar, Chandigarh, Ludhiana, Hoshiarpur, Airport Taxi) */}
        <PopularRoutesSection onOpenBooking={handleOpenBooking} />

        {/* Why Choose PB08 TAXI Section */}
        <WhyChooseUs onOpenBooking={handleOpenBooking} />

        {/* Frequently Asked Questions Section */}
        <FAQSection onOpenBooking={handleOpenBooking} />

        {/* Contact Section */}
        <ContactSection onOpenBooking={handleOpenBooking} />
      </main>

      {/* Footer */}
      <Footer onOpenBooking={handleOpenBooking} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp onOpenBooking={handleOpenBooking} />

      {/* One Click Book Your Ride Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
}
