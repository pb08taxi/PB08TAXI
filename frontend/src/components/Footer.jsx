import React from 'react';
import { Car, Heart, Shield, Lock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Footer({ onOpenBooking }) {
  const { settings } = useSiteSettings();
  const phone = settings?.support_phone || '+91 98765 43210';
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const brandTagline = settings?.brand_tagline || 'Fast • Safe • Reliable';

  return (
    <footer className="bg-black text-zinc-400 border-t border-zinc-900 relative">
      {/* Top taxi checker decoration */}
      <div className="h-1.5 taxi-checker opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {settings?.site_logo_url ? (
                <img
                  src={settings.site_logo_url}
                  alt={brandTitle}
                  style={{
                    height: `${Math.min(56, Math.max(32, settings?.site_logo_size ? Math.round(settings.site_logo_size * 0.85) : 40))}px`,
                    width: 'auto'
                  }}
                  className="max-h-14 max-w-[150px] object-contain rounded-xl bg-zinc-900/60 p-1 border border-zinc-800 flex-shrink-0"
                />
              ) : (
                <div
                  style={{
                    width: `${Math.min(56, Math.max(32, settings?.site_logo_size ? Math.round(settings.site_logo_size * 0.85) : 40))}px`,
                    height: `${Math.min(56, Math.max(32, settings?.site_logo_size ? Math.round(settings.site_logo_size * 0.85) : 40))}px`
                  }}
                  className="rounded-xl bg-taxi-yellow flex items-center justify-center text-black shadow-md flex-shrink-0"
                >
                  <Car className="w-6 h-6 stroke-[2.5]" />
                </div>
              )}
              <div>
                <span className="text-xl font-black text-white block leading-tight">
                  {brandTitle}
                </span>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold leading-tight mt-0.5">
                  {brandTagline}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Jalandhar's top-rated cab service delivering seamless point-to-point, airport, and outstation taxi travel with verified chauffeurs across North India.
            </p>
            <div className="pt-1 flex flex-col space-y-2">
              <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cabs Available Right Now</span>
              </span>
              <a href={telLink} className="inline-flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-taxi-yellow font-medium">
                <Phone className="w-3.5 h-3.5 text-taxi-yellow" />
                <span>Helpline: {phone}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-taxi-yellow transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-taxi-yellow transition-colors">Our Services</a></li>
              <li><a href="#why-us" className="hover:text-taxi-yellow transition-colors">Why Choose Us</a></li>
              <li><a href="#contact" className="hover:text-taxi-yellow transition-colors">Contact Information</a></li>
              <li>
                <button onClick={onOpenBooking} className="text-taxi-yellow hover:underline font-bold">
                  One Click Book Your Ride
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Popular Routes</h4>
            <ul className="space-y-2 text-xs">
              <li><span>Jalandhar ➔ Amritsar Airport (ATQ)</span></li>
              <li><span>Jalandhar ➔ Chandigarh Airport (IXC)</span></li>
              <li><span>Jalandhar ➔ Delhi IGI Airport (DEL)</span></li>
              <li><span>Jalandhar ➔ Dharamshala / Manali</span></li>
              <li><span>Jalandhar ➔ Ludhiana / Phagwara</span></li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Admin & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy-policy" className="hover:text-taxi-yellow text-zinc-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-taxi-yellow text-zinc-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service#passenger-conduct" className="hover:text-taxi-yellow text-zinc-400 transition-colors">
                  Safe Travel Guidelines
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center space-x-1.5 text-zinc-500 hover:text-taxi-yellow text-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Control Panel</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <p>© {new Date().getFullYear()} PB08 TAXI. All rights reserved.</p>
            <div className="flex items-center space-x-3 text-zinc-500">
              <span>•</span>
              <Link to="/privacy-policy" className="hover:text-taxi-yellow transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-taxi-yellow transition-colors">Terms of Service</Link>
            </div>
          </div>
          <p className="flex items-center space-x-1">
            <span>Built for Punjab with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>• Fast & Lightweight</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
