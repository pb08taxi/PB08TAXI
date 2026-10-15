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
                  width={Math.min(56, Math.max(32, settings?.site_logo_size ? Math.round(settings.site_logo_size * 0.85) : 40))}
                  srcSet={`${settings.site_logo_url} 1x, ${settings.site_logo_url} 2x`}
                  height={Math.min(56, Math.max(32, settings?.site_logo_size ? Math.round(settings.site_logo_size * 0.85) : 40))}
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
              Jalandhar's top-rated cab network delivering seamless point-to-point, airport transfers, and outstation taxi travel with verified chauffeurs across North India.
            </p>
            <address 
              itemScope 
              itemType="https://schema.org/PostalAddress" 
              className="not-italic text-xs text-zinc-400 space-y-1 bg-zinc-900/50 p-3 rounded-xl border border-zinc-855 block"
            >
              <p className="font-bold text-zinc-200">Physical Address / Central Hub.</p>
              <p className="text-zinc-300 leading-relaxed">
                <span itemProp="streetAddress">{settings?.physical_address?.split(',')[0] || 'Model Town, Near BMC Chowk'}</span>,{' '}
                <span itemProp="addressLocality">Jalandhar</span>,{' '}
                <span itemProp="addressRegion">Punjab</span>{' '}
                <span itemProp="postalCode">144001</span>,{' '}
                <span itemProp="addressCountry">India.</span>
              </p>
              <p className="text-zinc-400 pt-0.5">Phone: <a href={telLink} itemProp="telephone" className="text-taxi-yellow hover:underline">{phone}</a>.</p>
            </address>
            <div className="pt-1 flex flex-col space-y-2">
              <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cabs Available Right Now.</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links.</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#home" className="hover:text-taxi-yellow transition-colors">Home.</a></li>
              <li><Link to="/about" className="hover:text-taxi-yellow transition-colors font-medium">About Us.</Link></li>
              <li><a href="/#services" className="hover:text-taxi-yellow transition-colors">Our Services.</a></li>
              <li><a href="/#routes" className="hover:text-taxi-yellow transition-colors">One Way Jalandhar Routes.</a></li>
              <li><Link to="/popular-routes" className="hover:text-taxi-yellow text-taxi-yellow/90 font-semibold transition-colors">Popular Routes (All India).</Link></li>
              <li><a href="/#why-us" className="hover:text-taxi-yellow transition-colors">Why Choose Us.</a></li>
              <li><a href="/#faq" className="hover:text-taxi-yellow transition-colors">Frequently Asked Questions.</a></li>
              <li><Link to="/contact" className="hover:text-taxi-yellow transition-colors font-medium">Contact Us.</Link></li>
              <li>
                <button onClick={onOpenBooking} className="text-taxi-yellow hover:underline font-bold">
                  One Click Book Your Ride.
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Popular Taxi Routes.</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#routes" className="hover:text-taxi-yellow transition-colors">Jalandhar to Delhi / Delhi to Jalandhar.</a></li>
              <li><a href="/#routes" className="hover:text-taxi-yellow transition-colors">Jalandhar to Amritsar / Amritsar to Jalandhar.</a></li>
              <li><a href="/#routes" className="hover:text-taxi-yellow transition-colors">Jalandhar to Chandigarh / Chandigarh to Jalandhar.</a></li>
              <li><a href="/#routes" className="hover:text-taxi-yellow transition-colors">Jalandhar to Ludhiana / Ludhiana to Jalandhar.</a></li>
              <li><a href="/#routes" className="hover:text-taxi-yellow transition-colors">Jalandhar to Hoshiarpur / Hoshiarpur to Jalandhar.</a></li>
              <li><a href="/#routes" className="hover:text-taxi-yellow transition-colors">One Way Jalandhar &amp; Airport Taxi.</a></li>
              <li className="pt-1.5">
                <Link 
                  to="/popular-routes" 
                  className="inline-flex items-center space-x-1.5 text-taxi-yellow hover:text-taxi-yellowHover font-extrabold text-xs bg-taxi-yellow/10 hover:bg-taxi-yellow/20 px-3 py-1.5 rounded-lg border border-taxi-yellow/30 transition-all"
                >
                  <span>Explore All 35+ India Routes →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Admin &amp; Trust.</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy-policy" className="hover:text-taxi-yellow text-zinc-400 transition-colors">
                  Privacy Policy.
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-taxi-yellow text-zinc-400 transition-colors">
                  Terms of Service.
                </Link>
              </li>
              <li>
                <Link to="/safe-travel-guidelines" className="hover:text-taxi-yellow text-zinc-400 transition-colors">
                  Safe Travel Guidelines.
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-taxi-yellow text-zinc-400 transition-colors">
                  Editorial Policy.
                </Link>
              </li>
              {/* Dynamic Social Media Profiles from Site Settings */}
              <li className="pt-2">
                <span className="text-[11px] font-bold text-zinc-300 block mb-1">Connect With Us.</span>
                <div className="flex flex-wrap items-center gap-2 text-zinc-400 text-xs">
                  <a href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-taxi-yellow transition-colors">WhatsApp</a>
                  {settings?.social_facebook && (
                    <>
                      <span>•</span>
                      <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:text-taxi-yellow transition-colors">Facebook</a>
                    </>
                  )}
                  {settings?.social_instagram && (
                    <>
                      <span>•</span>
                      <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-taxi-yellow transition-colors">Instagram</a>
                    </>
                  )}
                  {settings?.social_twitter && (
                    <>
                      <span>•</span>
                      <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-taxi-yellow transition-colors">Twitter/X</a>
                    </>
                  )}
                  {settings?.social_youtube && (
                    <>
                      <span>•</span>
                      <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:text-taxi-yellow transition-colors">YouTube</a>
                    </>
                  )}
                </div>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center space-x-1.5 text-zinc-500 hover:text-taxi-yellow text-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Control Panel.</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer Note for Transparency */}
        <div className="mt-8 pt-4 border-t border-zinc-900 text-[11px] text-zinc-500 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>* Disclaimer &amp; Fair Pricing Policy: PB08 TAXI offers transparent, upfront pricing with zero surge charges. Government toll taxes, state border entry fees, and parking charges are charged on actuals without extra commission.</p>
          <time dateTime="2026-10-15" className="text-zinc-600 font-mono text-[10px] whitespace-nowrap">Last Verified: October 15, 2026.</time>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <p>© {new Date().getFullYear()} PB08 TAXI. All rights reserved.</p>
            <div className="flex items-center space-x-3 text-zinc-500">
              <span>•</span>
              <Link to="/privacy-policy" className="hover:text-taxi-yellow transition-colors">Privacy Policy.</Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-taxi-yellow transition-colors">Terms of Service.</Link>
              <span>•</span>
              <Link to="/editorial-policy" className="hover:text-taxi-yellow transition-colors">Editorial Policy.</Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2 gap-y-1 text-zinc-400 text-xs">
            <span>Owner: <strong className="text-zinc-200">Pawan Kumar</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Developed by <strong className="text-taxi-yellow font-semibold">Deepak</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
