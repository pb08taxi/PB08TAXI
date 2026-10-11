import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Car } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function ContactSection({ onOpenBooking }) {
  const { settings } = useSiteSettings();
  const phone = settings?.support_phone || '+91 98765 43210';
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;
  const rawWa = settings?.whatsapp_number || '919876543210';
  const cleanWa = rawWa.replace(/[^0-9]/g, '');
  return (
    <section id="contact" className="py-24 bg-[#0A0A0A] border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-taxi-yellow/10 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
            <span>Get In Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Contact PB08 TAXI
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Have questions about fares, routes, or wedding rentals? Reach our 24/7 central desk anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: 24/7 Helpline */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-taxi-yellow flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">24/7 Call Booking</h3>
            <p className="text-xs text-zinc-400">Direct booking helpline</p>
            <a 
              href={telLink} 
              className="text-taxi-yellow font-extrabold text-sm block hover:underline"
            >
              {phone}
            </a>
          </div>

          {/* Card 2: WhatsApp Chat */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-[#25D366] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">WhatsApp Support</h3>
            <p className="text-xs text-zinc-400">Live chat & instant dispatch</p>
            <a 
              href={`https://wa.me/${cleanWa}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-[#25D366] font-extrabold text-sm block hover:underline"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Card 3: Head Office */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-taxi-yellow flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Central Hub</h3>
            <p className="text-xs text-zinc-400">Model Town / BMC Chowk</p>
            <p className="text-xs text-zinc-300 font-semibold">
              Jalandhar, Punjab 144001
            </p>
          </div>

          {/* Card 4: Operating Hours */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-taxi-yellow flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Service Hours</h3>
            <p className="text-xs text-zinc-400">Open 365 Days a Year</p>
            <p className="text-xs text-zinc-300 font-semibold">
              Round the Clock (24x7)
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
