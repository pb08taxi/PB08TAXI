import React, { useState } from 'react';
import { Phone, Menu, X, Car, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackCallClick, trackBookRideClick } from '../utils/analytics';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'services', label: 'Our Services', path: '/#services' },
  { id: 'routes', label: 'Popular Routes', path: '/#routes' },
  { id: 'why-us', label: 'About Us', path: '/about' },
  { id: 'faq', label: 'FAQs', path: '/#faq' },
  { id: 'contact', label: 'Contact Us', path: '/contact' },
];

export default function Navbar({ onOpenBooking }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const phone = settings?.support_phone || '+91 98765 43210';
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const brandTagline = settings?.brand_tagline || 'Fast • Safe • Reliable';

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (item.path === '/about' || item.id === 'why-us') {
      if (location.pathname === '/' || location.pathname === '/about') {
        const el = document.getElementById('why-us') || document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '/about');
      } else {
        navigate('/about');
      }
      return;
    }

    if (item.path === '/contact' || item.id === 'contact') {
      if (location.pathname === '/' || location.pathname === '/contact') {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '/contact');
      } else {
        navigate('/contact');
      }
      return;
    }

    if (location.pathname === '/') {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${item.id}`);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(`/#${item.id}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      {/* Accessibility Skip to Main Content Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-taxi-yellow focus:text-black focus:font-extrabold focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-black"
      >
        Skip to main content
      </a>

      {/* Top micro banner */}
      <div className="bg-taxi-yellow text-black text-xs font-bold py-1 px-4 text-center tracking-wide flex items-center justify-center space-x-3">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 inline" />
          <span>{brandTitle} — PUNJAB'S TRUSTED 24/7 CAB SERVICE</span>
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline">JALANDHAR • AMRITSAR • CHANDIGARH • DELHI AIRPORT</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-20 py-2.5">
          
          {/* Brand Logo & Editable Text */}
          <Link 
            to="/" 
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', '/');
              }
            }}
            className="flex items-center space-x-3 group"
          >
            {settings?.site_logo_url ? (
              <img
                src={settings.site_logo_url}
                alt={brandTitle}
                width={settings?.site_logo_size || 48}
                height={settings?.site_logo_size || 48}
                srcSet={`${settings.site_logo_url} 1x, ${settings.site_logo_url} 2x`}
                loading="eager"
                fetchpriority="high"
                style={{ height: `${settings?.site_logo_size || 48}px`, width: 'auto' }}
                className="max-h-28 max-w-[220px] object-contain rounded-xl shadow-md group-hover:scale-105 transition-all bg-zinc-900/60 p-1 border border-zinc-800 flex-shrink-0"
              />
            ) : (
              <div
                style={{
                  width: `${settings?.site_logo_size || 48}px`,
                  height: `${settings?.site_logo_size || 48}px`
                }}
                className="rounded-xl bg-taxi-yellow flex items-center justify-center text-black shadow-lg shadow-taxi-yellow/20 group-hover:scale-105 transition-all flex-shrink-0"
              >
                <Car
                  style={{
                    width: `${Math.max(16, Math.round((settings?.site_logo_size || 48) * 0.55))}px`,
                    height: `${Math.max(16, Math.round((settings?.site_logo_size || 48) * 0.55))}px`
                  }}
                  className="text-black stroke-[2.5]"
                />
              </div>
            )}
            
            <div className="flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-taxi-yellow transition-colors leading-tight">
                {brandTitle}
              </span>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-zinc-400 font-semibold leading-tight mt-0.5">
                {brandTagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className="text-sm font-semibold text-zinc-300 hover:text-taxi-yellow transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href={telLink}
              onClick={() => trackCallClick('Desktop Navbar Helpline')}
              className="flex items-center space-x-2 text-zinc-200 hover:text-taxi-yellow px-3 py-2 text-sm font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-taxi-yellow" />
              <span>{phone}</span>
            </a>

            <button
              onClick={() => {
                trackBookRideClick('Navbar Book Ride');
                onOpenBooking();
              }}
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
              className="bg-taxi-yellow text-black font-extrabold px-4 py-2 rounded-full text-xs min-h-[42px] flex items-center justify-center active:scale-95 transition-transform"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-400 hover:text-white p-2 rounded-lg w-11 h-11 flex items-center justify-center"
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
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className="text-base font-semibold text-zinc-200 hover:text-taxi-yellow py-1"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-zinc-800 flex flex-col space-y-3">
            <a
              href={telLink}
              onClick={() => trackCallClick('Mobile Drawer Helpline')}
              className="flex items-center space-x-2 text-zinc-300 py-1 font-semibold"
            >
              <Phone className="w-4 h-4 text-taxi-yellow" />
              <span>Call: {phone}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                trackBookRideClick('Mobile Drawer Book Ride');
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
