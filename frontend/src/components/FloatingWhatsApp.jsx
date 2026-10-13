import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackWhatsAppClick } from '../utils/analytics';

export default function FloatingWhatsApp({ onOpenBooking }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { settings } = useSiteSettings();

  const handleClick = () => {
    trackWhatsAppClick('Floating WhatsApp Button');
    // Open official WhatsApp direct chat link with prefilled booking intent
    const rawNumber = settings?.whatsapp_number || '919876543210';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent("Hi PB08 TAXI, I want to book a taxi ride.");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center">
      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="mr-3 bg-zinc-900 border border-zinc-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xl whitespace-nowrap animate-fade-in flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Chat with PB08 TAXI Support</span>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/20 animate-bounce-gentle group"
        aria-label="Contact PB08 TAXI on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-[#25D366] group-hover:rotate-6 transition-transform" />
      </button>
    </div>
  );
}
