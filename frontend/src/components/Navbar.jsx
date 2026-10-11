import React, { useState } from 'react';
import { Phone, Menu, X, Car, ShieldCheck } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Navbar({ onOpenBooking }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();

  const phone = settings?.support_phone || '+91 98765 43210';
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      {/* Top micro banner */}
      <div className="bg-taxi-yellow text-black text-xs font-bold py-1 px-4 text-center tracking-wide flex items-center justify-center space-x-3">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 inline" />
          <span>PB08 TAXI — PUNJAB'S TRUSTED 24/7 CAB SERVICE</span>
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline">JALANDHAR • AMRITSAR • CHANDIGARH • DELHI AIRPORT</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center space-x-3 group">
            {settings?.site_logo_url ? (
              <img
                src={settings.site_logo_url}
                alt="PB08 TAXI"
                className="h-12 max-w-[180px] object-contain rounded-lg group-hover:scale-105 transition-transform"
              />
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-taxi-yellow flex items-center justify-center text-black shadow-lg shadow-taxi-yellow/20 group-hover:scale-105 transition-transform">
                  <Car className="w-7 h-7 text-black stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-2xl font-black tracking-tight text-white group-hover:text-taxi-yellow transition-colors">
                      PB08
                    </span>
                    <span className="text-2xl font-black tracking-tight text-taxi-yellow">
                      TAXI
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                    Fast • Safe • Reliable
                  </p>
                </div>
              </>
            )}
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-sm font-semibold text-zinc-300 hover:text-taxi-yellow transition-colors">
              Home
            </a>
            <a href="#services" className="text-sm font-semibold text-zinc-300 hover:text-taxi-yellow transition-colors">
              Our Services
            </a>
            <a href="#why-us" className="text-sm font-semibold text-zinc-300 hover:text-taxi-yellow transition-colors">
              Why Choose Us
            </a>
            <a href="#contact" className="text-sm font-semibold text-zinc-300 hover:text-taxi-yellow transition-colors">
              Contact Us
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href={telLink}
              className="flex items-center space-x-2 text-zinc-200 hover:text-taxi-yellow px-3 py-2 text-sm font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-taxi-yellow" />
              <span>{phone}</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-5 py-2.5 rounded-full text-sm shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <Car className="w-4 h-4" />
              <span>Book Ride</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenBooking}
              className="bg-taxi-yellow text-black font-bold px-3 py-1.5 rounded-full text-xs"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-400 hover:text-white p-2 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-zinc-200 hover:text-taxi-yellow py-1"
            >
              Home
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-zinc-200 hover:text-taxi-yellow py-1"
            >
              Our Services
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-zinc-200 hover:text-taxi-yellow py-1"
            >
              Why Choose Us
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-zinc-200 hover:text-taxi-yellow py-1"
            >
              Contact Us
            </a>
          </nav>

          <div className="pt-2 border-t border-zinc-800 flex flex-col space-y-3">
            <a
              href={telLink}
              className="flex items-center space-x-2 text-zinc-300 py-1 font-semibold"
            >
              <Phone className="w-4 h-4 text-taxi-yellow" />
              <span>Call: {phone}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full bg-taxi-yellow text-black font-extrabold py-3 rounded-xl text-center shadow-md shadow-taxi-yellow/20"
            >
              One Click Book Your Ride
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
