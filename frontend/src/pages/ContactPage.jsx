import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Car, 
  ArrowLeft, 
  Sparkles,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { updatePageMeta } from '../utils/seo';
import { trackPageView, trackCallClick } from '../utils/analytics';

const BookingModal = React.lazy(() => import('../components/BookingModal'));

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+91 98880 79736';
  const whatsappNumber = settings?.whatsapp_number || '+91 98880 79736';
  const cleanPhone = supportPhone.replace(/\D/g, '');
  const cleanWa = whatsappNumber.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/contact');

    updatePageMeta({
      title: `Contact Us — ${brandTitle} | 24/7 Taxi Booking, WhatsApp & Jalandhar Office`,
      description: `Contact ${brandTitle} 24/7 in Jalandhar. Call ${supportPhone} or WhatsApp for instant taxi booking, airport transfers, and outstation cab dispatch in Punjab.`,
      canonicalUrl: 'https://www.pb08taxi.com/contact',
      keywords: 'contact pb08 taxi, taxi number jalandhar, cab booking phone number, pb08 taxi whatsapp, model town taxi stand jalandhar'
    });

    // Injected ContactPage & ContactPoint Schema
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": `Contact ${brandTitle}`,
      "url": "https://www.pb08taxi.com/contact",
      "description": `Official 24/7 customer contact desk and dispatch office for ${brandTitle} in Jalandhar, Punjab.`,
      "mainEntity": {
        "@type": "TaxiService",
        "name": brandTitle,
        "url": "https://www.pb08taxi.com/",
        "telephone": supportPhone,
        "email": "pb08taxi@gmail.com",
        "priceRange": "₹₹",
        "areaServed": "Jalandhar, Punjab, Delhi NCR, Himachal Pradesh, India",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Model Town, Near BMC Chowk",
          "addressLocality": "Jalandhar",
          "addressRegion": "Punjab",
          "postalCode": "144001",
          "addressCountry": "IN"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": supportPhone,
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi", "Punjabi"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "00:00",
            "closes": "23:59"
          }
        }
      }
    };

    let scriptTag = document.getElementById('schema-contact-page');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-contact-page';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById('schema-contact-page');
      if (el) el.remove();
    };
  }, [brandTitle, supportPhone]);

  return (
    <div className="min-h-screen bg-taxi-black text-white selection:bg-taxi-yellow selection:text-black font-sans flex flex-col">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium mb-8">
            <Link to="/" className="hover:text-taxi-yellow flex items-center space-x-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-200">Help &amp; Support</span>
            <span>/</span>
            <span className="text-taxi-yellow">Contact Us</span>
          </div>

          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-8 sm:p-12 lg:p-16 mb-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>24/7 Operations Desk Live</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Contact <span className="text-taxi-yellow">{brandTitle}</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                Need an immediate taxi in Jalandhar, an airport pickup from Delhi IGI / Amritsar ATQ, 
                or a custom one-way outstation quote? Our dispatch desk is available round-the-clock.
              </p>
            </div>
          </div>

          {/* 4 Primary Contact Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            
            {/* Phone Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-taxi-yellow/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-taxi-yellow/10 border border-taxi-yellow/30 flex items-center justify-center text-taxi-yellow mb-4 group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Phone Call</h3>
                <p className="text-xs text-zinc-400 mb-4">Direct connection with our on-duty dispatcher in Jalandhar.</p>
                <div className="text-sm font-bold text-taxi-yellow font-mono">{supportPhone}</div>
              </div>
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => trackCallClick('Contact Page Phone Card')}
                className="mt-6 w-full py-2.5 rounded-xl bg-taxi-yellow text-black font-bold text-xs text-center hover:bg-yellow-400 transition-colors block"
              >
                Call Dispatch Desk
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">WhatsApp Chat</h3>
                <p className="text-xs text-zinc-400 mb-4">Fastest response for fare estimates, car photos &amp; live driver tracking.</p>
                <div className="text-sm font-bold text-emerald-400 font-mono">{whatsappNumber}</div>
              </div>
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20PB08%20TAXI,%20I%20need%20cab%20information.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center hover:bg-emerald-500 transition-colors block"
              >
                Chat on WhatsApp
              </a>
            </div>

            {/* Email Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Official Email</h3>
                <p className="text-xs text-zinc-400 mb-4">Corporate booking, GST invoice requests, and partnership queries.</p>
                <div className="text-sm font-bold text-blue-400 font-mono">pb08taxi@gmail.com</div>
              </div>
              <a
                href="mailto:pb08taxi@gmail.com?subject=Taxi%20Inquiry%20-%20PB08%20TAXI"
                className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center border border-zinc-700 transition-colors block"
              >
                Send Email
              </a>
            </div>

            {/* Office Hub Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Central Hub</h3>
                <p className="text-xs text-zinc-400 mb-4">Model Town, Near BMC Chowk, Jalandhar, Punjab 144001, India.</p>
                <div className="text-xs font-semibold text-zinc-300">Open 24/7/365</div>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Model+Town+BMC+Chowk+Jalandhar"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center border border-zinc-700 transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>View Google Map</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            </div>

          </div>

          {/* Booking & Operational Guarantee Section */}
          <div className="grid md:grid-cols-12 gap-8 mb-16">
            
            {/* Left Column: Quick Booking Action */}
            <div className="md:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-6">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-taxi-yellow uppercase tracking-wider">
                <Car className="w-4 h-4" />
                <span>Instant Online Reservation</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Book in Under 30 Seconds with Zero Upfront Payment
              </h2>

              <p className="text-sm text-zinc-300 leading-relaxed">
                You do not need to call or wait on hold. Use our live interactive booking tool to select your pickup location, 
                destination, travel date, time, and vehicle preference (Dzire, Ertiga, Innova Crysta).
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Instant WhatsApp booking confirmation sent immediately</span>
                </div>
                <div className="flex items-center space-x-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Chauffeur and car number details shared well before departure</span>
                </div>
                <div className="flex items-center space-x-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Free cancellation up to 2 hours before scheduled pickup</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-taxi-yellow text-black font-extrabold text-sm hover:bg-yellow-400 transition-all shadow-xl shadow-taxi-yellow/20 flex items-center justify-center space-x-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Open Online Booking Form</span>
                </button>
              </div>
            </div>

            {/* Right Column: 24/7 Highway Support Guarantee */}
            <div className="md:col-span-5 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-taxi-yellow uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Highway Dispatch Desk</span>
                </div>

                <h3 className="text-xl font-bold text-white">
                  Flight Delayed or Need Midnight Highway Assistance?
                </h3>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Our live support desk operates 24/7 without automated bots. If your flight into Delhi IGI or Amritsar Airport is delayed, 
                  our team adjusts driver arrival timing automatically at no additional waiting charge.
                </p>

                <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-zinc-300">
                    <Clock className="w-4 h-4 text-taxi-yellow" />
                    <span>Average Dispatch Response: <strong className="text-white">Under 2 Minutes</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-zinc-300">
                    <Navigation className="w-4 h-4 text-taxi-yellow" />
                    <span>Active GPS Route Monitoring on all Intercity Trips</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${cleanPhone}`}
                className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center border border-zinc-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-taxi-yellow" />
                <span>Call Emergency Support: {supportPhone}</span>
              </a>
            </div>

          </div>

        </div>
      </main>

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Booking Modal */}
      {isBookingOpen && (
        <React.Suspense fallback={null}>
          <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </React.Suspense>
      )}

      <Footer onOpenBooking={() => setIsBookingOpen(true)} />
    </div>
  );
}
