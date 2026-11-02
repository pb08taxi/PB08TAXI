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
  Plane,
  Luggage,
  CalendarCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackPageView, trackModalOpen } from '../utils/analytics';
import { updatePageMeta } from '../utils/seo';

const BookingModal = React.lazy(() => import('../components/BookingModal'));

export default function AirportTaxiPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+91 98880 79736';
  const cleanPhone = supportPhone.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/airport-taxi-jalandhar');
    updatePageMeta({
      title: `Airport Taxi Jalandhar — 24/7 Delhi IGI & Amritsar Airport Cabs | ${brandTitle}`,
      description: `Reliable 24/7 airport taxi from Jalandhar to Delhi IGI Airport, Amritsar ATQ & Chandigarh IXC with ${brandTitle}. Flight delay monitoring & verified chauffeurs.`,
      canonicalUrl: 'https://www.pb08taxi.com/airport-taxi-jalandhar',
      keywords: 'airport taxi jalandhar, delhi airport taxi from jalandhar, amritsar airport cab, chandigarh airport taxi'
    });

    // Dynamic Schema Injection for Airport Taxi Service
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "TaxiService",
      "name": "Airport Taxi Jalandhar - PB08 TAXI",
      "alternateName": [
        "Airport Taxi Jalandhar",
        "Delhi Airport Taxi Jalandhar",
        "Amritsar Airport Taxi Jalandhar",
        "Chandigarh Airport Taxi Jalandhar",
        "Airport Cab Service Punjab"
      ],
      "url": "https://www.pb08taxi.com/airport-taxi-jalandhar",
      "telephone": supportPhone,
      "priceRange": "₹₹",
      "areaServed": [
        "Jalandhar",
        "Delhi IGI Airport (DEL)",
        "Amritsar Airport (ATQ)",
        "Chandigarh Airport (IXC)",
        "Punjab"
      ],
      "description": "24/7 dedicated airport taxi service connecting Jalandhar with Delhi IGI Airport, Amritsar ATQ, and Chandigarh IXC with guaranteed flight delay tracking."
    };

    let scriptTag = document.getElementById('schema-airport-taxi');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-airport-taxi';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById('schema-airport-taxi');
      if (el) el.remove();
    };
  }, [brandTitle, supportPhone]);

  const handleOpenBooking = (source = 'Airport Taxi Page') => {
    trackModalOpen(typeof source === 'string' ? source : 'Airport Taxi Page');
    setIsBookingOpen(true);
  };

  const AIRPORT_TRANSFERS = [
    {
      name: "Delhi IGI Airport (DEL) T1 / T2 / T3",
      distance: "~375 km",
      time: "6–7 Hours via NH44",
      highlight: "Direct Terminal Dropoff / Aerocity Pickup",
      sedanPrice: "From ₹3,999 Flat",
      suvPrice: "From ₹5,499 Flat",
      details: "Non-stop highway ride with dedicated stopovers. Chauffeur tracks your flight number to ensure zero wait times at international arrival gates."
    },
    {
      name: "Amritsar Airport (ATQ) — Sri Guru Ram Dass Jee",
      distance: "~85 km",
      time: "1.5 Hours via GT Road",
      highlight: "Closest International Hub to Jalandhar",
      sedanPrice: "From ₹1,199 Flat",
      suvPrice: "From ₹1,799 Flat",
      details: "Direct doorstep pickup in Jalandhar. Perfect for early morning international UK/Canada/UAE departures."
    },
    {
      name: "Chandigarh International Airport (IXC)",
      distance: "~150 km",
      time: "2.5 Hours via NH344A",
      highlight: "Shaheed Bhagat Singh International Airport",
      sedanPrice: "From ₹1,899 Flat",
      suvPrice: "From ₹2,799 Flat",
      details: "Express transit via fast highway connecting Jalandhar with Mohali international terminal."
    }
  ];

  const FAQS = [
    {
      q: "What happens if my incoming flight to Delhi or Amritsar is delayed?",
      a: "Zero worries! When booking with PB08 TAXI, you share your flight number. Our 24/7 dispatch team actively tracks your live flight landing time. Even if your flight is delayed by 2-3 hours, your chauffeur will be waiting at the arrivals terminal without any extra waiting penalties."
    },
    {
      q: "Can we fit multiple large NRI suitcases into the cab?",
      a: "Yes! For travelers carrying 4 to 8 large check-in bags, we strongly recommend our Toyota Innova Crysta or Maruti Ertiga fleets equipped with spacious boot spaces and optional secure roof luggage carriers."
    },
    {
      q: "Are midnight pickups from Jalandhar to Delhi airport safe?",
      a: "Safety is our #1 priority. PB08 TAXI only deploys 100% police-verified, non-smoking highway chauffeurs with extensive night-driving experience on NH44. Every trip is GPS-tracked, and real-time ride details are shared with your family via WhatsApp."
    },
    {
      q: "How far in advance should I book my airport taxi?",
      a: "While we can arrange emergency airport cabs within 30-45 minutes in Jalandhar, we recommend booking 12 to 24 hours in advance to guarantee your preferred car model (like Innova Crysta) and chauffeur assignment."
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
            <span className="text-taxi-yellow">Airport Taxi Jalandhar</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-taxi-yellow/15 border border-taxi-yellow/30 text-taxi-yellow text-xs font-bold uppercase tracking-wider">
                <Plane className="w-4 h-4" />
                <span>24/7 Punjab Airport Transfers • On-Time Guarantee</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Airport Taxi Jalandhar — 24/7 Delhi IGI &amp; Amritsar Cabs
              </h1>

              {/* Direct Answer GEO Box */}
              <div className="bg-zinc-900/90 border border-taxi-yellow/30 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-zinc-200 leading-relaxed space-y-2">
                <p>
                  Need a guaranteed <strong className="text-taxi-yellow">Airport Taxi from Jalandhar</strong>? PB08 TAXI provides 24/7 door-to-terminal cab service to Delhi IGI Airport (DEL T1, T2, T3), Amritsar International Airport (ATQ), and Chandigarh Airport (IXC). We offer flat upfront fares, large luggage capacity fleets (Innova Crysta, Ertiga), and complimentary flight delay tracking.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400 font-semibold">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Flight Delay Tracking</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terminal Gate Dropoff</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Spacious NRI Luggage Boot</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenBooking('Airport Taxi Hero CTA')}
                  className="px-8 py-4 bg-taxi-yellow text-black font-extrabold text-base rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-taxi-yellow/20 flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <Plane className="w-5 h-5" />
                  <span>Book Airport Cab Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=Hi%20PB08%20TAXI,%20I%20need%20an%20Airport%20Taxi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 text-white font-bold text-base rounded-2xl hover:bg-zinc-850 transition-all flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp: {supportPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Airport Hub Matrix */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Major Airport Transfer Connections
            </h2>
            <p className="text-sm text-zinc-400">
              Fixed rate doorstep pickups connecting Jalandhar with all North India flight hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AIRPORT_TRANSFERS.map((apt, idx) => (
              <div
                key={idx}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 hover:border-taxi-yellow/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-taxi-yellow text-xs font-bold uppercase tracking-wider">
                    <Plane className="w-4 h-4" />
                    <span>{apt.highlight}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{apt.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{apt.details}</p>

                  <div className="pt-2 border-t border-zinc-900 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Sedan (Dzire):</span>
                      <strong className="text-taxi-yellow">{apt.sedanPrice}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">SUV (Innova Crysta):</span>
                      <strong className="text-white">{apt.suvPrice}</strong>
                    </div>
                    <div className="flex justify-between text-xs pt-1 text-zinc-500">
                      <span>Travel Duration:</span>
                      <span>{apt.time}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBooking(`Airport: ${apt.name}`)}
                  className="w-full py-3 bg-zinc-900 hover:bg-taxi-yellow hover:text-black text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer mt-4"
                >
                  Book Cab for {apt.name.split('(')[0]}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Airport Fleet Benefits */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Flight Passenger Perks</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Engineered For Stress-Free Airport Travel
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-300 pt-2">
              <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-2">
                <Luggage className="w-6 h-6 text-taxi-yellow" />
                <h4 className="font-bold text-white text-sm">Ample Luggage Capacity</h4>
                <p className="text-zinc-400 leading-relaxed">
                  Our Innova Crysta and Ertiga cabs handle 4 to 8 international check-in trolleys with ease, plus secure roof carriers if needed.
                </p>
              </div>

              <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-2">
                <Clock className="w-6 h-6 text-taxi-yellow" />
                <h4 className="font-bold text-white text-sm">On-Time Zero Delay</h4>
                <p className="text-zinc-400 leading-relaxed">
                  Chauffeurs arrive 15 minutes before your scheduled pickup time. We account for highway diversions so you never miss a flight.
                </p>
              </div>

              <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-2">
                <ShieldCheck className="w-6 h-6 text-taxi-yellow" />
                <h4 className="font-bold text-white text-sm">Night Highway Verified</h4>
                <p className="text-zinc-400 leading-relaxed">
                  Trained highway chauffeurs specialized in foggy Punjab winter nights and 24/7 expressways with commercial insurance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Airport Taxi FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Questions About Airport Taxi Service
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
