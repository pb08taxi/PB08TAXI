import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackWhatsAppClick } from '../utils/analytics';

export default function FloatingWhatsApp({ onOpenBooking }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 280);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleClick = () => {
    trackWhatsAppClick('Floating WhatsApp Button');
    // Open official WhatsApp direct chat link with prefilled booking intent
    const rawNumber = settings?.whatsapp_number || '919876543210';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent("Hi PB08 TAXI, I want to book a taxi ride.");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <div
      className="fixed z-40 flex flex-col items-end space-y-2.5 pointer-events-none select-none"
      style={{
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        right: 'calc(1rem + env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Scroll to Top Button (Smooth fade & translate) */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top of page"
        title="Scroll to Top"
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-taxi-yellow border border-zinc-700/80 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 group focus:outline-none focus:ring-2 focus:ring-taxi-yellow ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Floating Action Button with clear 'Chat Support' Text */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Chat Support on WhatsApp"
        className="pointer-events-auto group flex items-center space-x-2 sm:space-x-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 sm:px-4.5 py-2.5 sm:py-3 rounded-full shadow-2xl shadow-emerald-500/30 border-2 border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 animate-bounce-gentle"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-[#25D366] group-hover:rotate-12 transition-transform duration-300" />
        </div>
        
        <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white drop-shadow-sm whitespace-nowrap">
          Chat Support
        </span>

        {/* Live status pulsing dot */}
        <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0" title="Online 24/7">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-white"></span>
        </span>
      </button>
    </div>
  );
}
