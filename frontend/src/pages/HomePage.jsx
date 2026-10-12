import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import ServicesSection from '../components/ServicesSection';
import WhyChooseUs from '../components/WhyChooseUs';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import BookingModal from '../components/BookingModal';
import SEOHead from '../components/SEOHead';

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleOpenBooking = () => setIsBookingOpen(true);
  const handleCloseBooking = () => setIsBookingOpen(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-taxi-yellow selection:text-black">
      {/* Dynamic SEO Head Management */}
      <SEOHead />

      {/* Navigation */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero Slider with 'One Click Book Your Ride' CTA */}
      <HeroSlider onOpenBooking={handleOpenBooking} />

      {/* Services Section */}
      <ServicesSection onOpenBooking={handleOpenBooking} />

      {/* Why Choose PB08 TAXI Section */}
      <WhyChooseUs onOpenBooking={handleOpenBooking} />

      {/* Frequently Asked Questions Section */}
      <FAQSection onOpenBooking={handleOpenBooking} />

      {/* Contact Section */}
      <ContactSection onOpenBooking={handleOpenBooking} />

      {/* Footer */}
      <Footer onOpenBooking={handleOpenBooking} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp onOpenBooking={handleOpenBooking} />

      {/* One Click Book Your Ride Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
}
