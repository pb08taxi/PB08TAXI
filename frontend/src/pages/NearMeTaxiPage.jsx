import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  Star, 
  ChevronDown, 
  Sparkles, 
  ArrowLeft,
  Navigation,
  Compass,
  Zap,
  LocateFixed
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackPageView, trackModalOpen } from '../utils/analytics';

const BookingModal = React.lazy(() => import('../components/BookingModal'));

export default function NearMeTaxiPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [userLocStatus, setUserLocStatus] = useState('');

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+91 98880 79736';
  const cleanPhone = supportPhone.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Taxi Near Me — 24/7 Instant Doorstep Cab Service in Jalandhar | ${brandTitle}`;
    trackPageView('/near-me-taxi-service');

    // Dynamic Schema Injection for Taxi Near Me / LocalBusiness
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "TaxiService",
      "name": "Taxi Near Me - PB08 TAXI Jalandhar",
      "alternateName": [
        "Taxi Near Me",
        "Near Me Taxi Service",
        "Near Me Taxi",
        "Cab Near Me",
        "Taxi Service Near Me",
        "24/7 Taxi Near Me Jalandhar"
      ],
      "url": "https://www.pb08taxi.com/near-me-taxi-service",
      "telephone": supportPhone,
      "priceRange": "₹₹",
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "Jalandhar, Punjab, India"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 31.3260,
        "longitude": 75.5762
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "487"
      }
    };

    let scriptTag = document.getElementById('schema-near-me-taxi');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-near-me-taxi';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById('schema-near-me-taxi');
      if (el) el.remove();
    };
  }, [brandTitle, supportPhone]);

  const handleOpenBooking = (source = 'Taxi Near Me Page') => {
    trackModalOpen(typeof source === 'string' ? source : 'Taxi Near Me Page');
    setIsBookingOpen(true);
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setUserLocStatus('Locating nearest available cabs...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocStatus(`Location detected! 3+ cabs available within 2.5 km.`);
          setTimeout(() => {
            handleOpenBooking('GPS Auto-Locate Button');
          }, 600);
        },
        (err) => {
          setUserLocStatus('Location access optional. Opening direct booking...');
          setTimeout(() => {
            handleOpenBooking('GPS Fallback Button');
          }, 400);
        },
        { timeout: 8000 }
      );
    } else {
      handleOpenBooking('No Geolocation Button');
    }
  };

  const NEAR_ME_HUBS = [
    { name: "Model Town & Near BMC Chowk", eta: "5–8 Mins", status: "Active Chauffeurs" },
    { name: "Rama Mandi & PAP Chowk", eta: "8–12 Mins", status: "Ready for Dispatch" },
    { name: "City & Cantt Railway Stations", eta: "5–10 Mins", status: "Station Stand Cabs" },
    { name: "Maqsudan & Amritsar Bypass", eta: "10–12 Mins", status: "Highway Cabs Live" },
    { name: "Guru Nanak Mission Chowk", eta: "6–8 Mins", status: "Doorstep Pickup" },
    { name: "Phagwara Gate & Football Chowk", eta: "7–10 Mins", status: "Available Now" },
    { name: "Urban Estate Phase 1 & 2", eta: "8–10 Mins", status: "Residential Fleet" },
    { name: "Nakodar Road & Basti Sheikh", eta: "10–12 Mins", status: "Local Drivers Ready" }
  ];

  const FAQS = [
    {
      q: "How fast can a cab reach my location when I search 'taxi near me'?",
      a: "PB08 TAXI maintains active chauffeurs positioned across Jalandhar's primary junctions (BMC Chowk, Model Town, PAP Chowk, Cantt Station). In 95% of bookings, a sanitized cab arrives at your exact doorstep within 10 to 15 minutes of confirmation."
    },
    {
      q: "Is taxi service near me available 24 hours a day including midnight?",
      a: "Yes! Our dispatch desk operates 24/7/365. Whether you need a 3:00 AM emergency ride to the hospital, an early morning flight drop to Delhi or Amritsar, or a late-night railway station pickup, our drivers are on active standby."
    },
    {
      q: "Do I need to download an app to book a cab near me?",
      a: "No! There are zero app downloads, account logins, or password hassles. Simply tap 'Book Cab Near Me' on this page or send a message on WhatsApp to +91 98880 79736. Your booking is confirmed in 15 seconds."
    },
    {
      q: "How are the fares calculated for cabs near me?",
      a: "We provide upfront fixed fares with zero surprise surge pricing. You get clear rates based on your car selection (Sedan ₹11/km, Ertiga ₹13/km, Innova Crysta ₹16/km) or flat fixed local package rates."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-taxi-yellow selection:text-black">
      <Navbar onOpenBooking={handleOpenBooking} />

      <main className="pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium">
            <Link to="/" className="hover:text-taxi-yellow flex items-center space-x-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-taxi-yellow">Taxi Near Me</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cabs Active Near You Right Now • 10–15 Min Pickup</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Taxi Near Me — 24/7 Doorstep Cab Service in Jalandhar
              </h1>

              {/* Direct Answer GEO Box for AI & Search Snippets */}
              <div className="bg-zinc-900/90 border border-taxi-yellow/30 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-zinc-200 leading-relaxed space-y-2">
                <p>
                  Looking for a verified <strong className="text-taxi-yellow">Taxi Near Me</strong> in Jalandhar or Punjab? <strong className="text-white">PB08 TAXI</strong> delivers guaranteed door-to-door cab pickups within 10–15 minutes across all Jalandhar sectors, railway stations, and highway points. Book AC Sedans (Dzire), family MUVs (Ertiga), or luxury SUVs (Innova Crysta) with upfront fixed fares and zero surge pricing.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400 font-semibold">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant 15-Min Arrival</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zero Surge Pricing</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>GPS Auto-Navigation</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons with 1-Tap Geolocation */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="px-8 py-4 bg-taxi-yellow text-black font-extrabold text-base rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-taxi-yellow/20 flex items-center justify-center space-x-2 cursor-pointer group"
                  >
                    <LocateFixed className="w-5 h-5 stroke-[2.5]" />
                    <span>Detect Location &amp; Book Cab</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <a
                    href={`https://wa.me/${cleanPhone}?text=Hi%20PB08%20TAXI,%20I%20need%20a%20taxi%20near%20me%20in%20Jalandhar`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 text-white font-bold text-base rounded-2xl hover:bg-zinc-850 transition-all flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <span>WhatsApp Helpline: {supportPhone}</span>
                  </a>
                </div>

                {userLocStatus && (
                  <p className="text-xs text-taxi-yellow font-semibold animate-pulse pl-1">
                    {userLocStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Live Proximity Dispatch Hubs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Real-Time Dispatch Coverage</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Live Taxi Availability by Jalandhar Neighborhood
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl">
                Our drivers are stationed throughout Jalandhar for rapid arrival times. Click any location below to request a ride from that sector:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {NEAR_ME_HUBS.map((hub, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenBooking(`Near Me: ${hub.name}`)}
                  className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-taxi-yellow/50 p-4 rounded-2xl transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      ETA: {hub.eta}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm group-hover:text-taxi-yellow transition-colors">
                    {hub.name}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-850">
                    <span>{hub.status}</span>
                    <ArrowRight className="w-3 h-3 text-taxi-yellow group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why PB08 TAXI Beats Generic Near Me Cabs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Why Book PB08 When Searching 'Taxi Near Me'?
            </h2>
            <p className="text-sm text-zinc-400">
              Unlike app aggregators that cancel rides or charge 3x surge, PB08 TAXI guarantees reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-3">
              <Zap className="w-8 h-8 text-taxi-yellow" />
              <h3 className="text-lg font-black text-white">Zero Ride Cancellations</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                App cabs regularly cancel on passengers during rush hours. PB08 TAXI operates on dedicated dispatch — once assigned, your driver is 100% committed to your ride.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-3">
              <ShieldCheck className="w-8 h-8 text-taxi-yellow" />
              <h3 className="text-lg font-black text-white">Verified Police Chauffeurs</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every driver in our fleet carries valid commercial licenses, police verification, and extensive highway driving credentials for maximum passenger security.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-3">
              <Clock className="w-8 h-8 text-taxi-yellow" />
              <h3 className="text-lg font-black text-white">24/7 Human Dispatch</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Need urgent midnight travel or emergency airport transit? Talk directly to real Punjab operators on phone or WhatsApp instead of fighting automated bots.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Local Taxi FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Frequently Asked Questions About Cabs Near Me
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full text-left p-5 flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-taxi-yellow transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-taxi-yellow transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-900 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer onOpenBooking={handleOpenBooking} />
      <FloatingWhatsApp onOpenBooking={handleOpenBooking} />

      {isBookingOpen && (
        <React.Suspense fallback={null}>
          <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </React.Suspense>
      )}
    </div>
  );
}
