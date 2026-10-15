import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('pb08_cookie_consent');
      if (!consent) {
        // Show after small delay so initial page load is fast
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('pb08_cookie_consent', 'accepted');
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted',
        });
      }
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('pb08_cookie_consent', 'declined');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-white block text-sm mb-1">Your Privacy &amp; Cookies</span>
            We use essential cookies and anonymous analytics to ensure smooth taxi bookings and improve our services across Punjab. Read our{' '}
            <Link to="/privacy-policy" className="text-taxi-yellow underline hover:text-yellow-400">
              Privacy Policy
            </Link>.
          </div>
          <button
            onClick={handleDecline}
            aria-label="Dismiss cookie notice"
            className="text-zinc-500 hover:text-white transition-colors p-1 -mr-1 -mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-zinc-850">
          <button
            onClick={handleAccept}
            className="flex-1 bg-taxi-yellow hover:bg-yellow-400 text-black font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            Accept All
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white font-medium text-xs py-2 px-3 rounded-xl border border-zinc-800 transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
