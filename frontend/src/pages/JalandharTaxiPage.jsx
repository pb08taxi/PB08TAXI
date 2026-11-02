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
  Navigation
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackPageView, trackModalOpen } from '../utils/analytics';

const BookingModal = React.lazy(() => import('../components/BookingModal'));

export default function JalandharTaxiPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+91 98880 79736';
  const cleanPhone = supportPhone.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Jalandhar Taxi Service — 24/7 Verified Cabs & Local Drops | ${brandTitle}`;
    trackPageView('/jalandhar-taxi-service');

    // Dynamic Schema Injection for Jalandhar Taxi Service
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "TaxiService",
      "name": "Jalandhar Taxi Service - PB08 TAXI",
      "alternateName": [
        "Jalandhar Taxi",
        "Jalandhar Taxi Service",
        "Jalndhar Taxi Service",
        "pb08 taxi Service",
        "PB08 Taxi",
        "PB08 TAXI Jalandhar",
        "Best Taxi Service in Jalandhar"
      ],
      "url": "https://www.pb08taxi.com/jalandhar-taxi-service",
      "telephone": supportPhone,
      "priceRange": "₹₹",
      "areaServed": "Jalandhar, Punjab, India",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Model Town, Near BMC Chowk",
        "addressLocality": "Jalandhar",
        "addressRegion": "Punjab",
        "postalCode": "144001",
        "addressCountry": "IN"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "487"
      }
    };

    let scriptTag = document.getElementById('schema-jalandhar-taxi');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-jalandhar-taxi';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById('schema-jalandhar-taxi');
      if (el) el.remove();
    };
  }, [brandTitle, supportPhone]);

  const handleOpenBooking = (source = 'Jalandhar Taxi Page') => {
    trackModalOpen(typeof source === 'string' ? source : 'Jalandhar Taxi Page');
    setIsBookingOpen(true);
  };

  const FAQS = [
    {
      q: "How can I book Jalandhar Taxi Service instantly?",
      a: "Booking a cab in Jalandhar with PB08 TAXI takes just 15 seconds. Click the 'One Click Book Your Ride' button on this page, choose your car and date, or directly message us on 24/7 WhatsApp at +91 98880 79736. We dispatch verified sanitized cabs with zero advance deposit required."
    },
    {
      q: "What types of cabs are available in Jalandhar with PB08 TAXI?",
      a: "We maintain a full fleet of AC sedans (Maruti Suzuki Dzire, Honda Amaze), premium family SUVs (Toyota Innova Crysta, Maruti Ertiga, Mahindra Scorpio), luxury executive cars (Toyota Fortuner), and 12-17 seater Tempo Travellers for group travel."
    },
    {
      q: "Are the fares fixed with zero surge charges?",
      a: "Yes! PB08 TAXI operates on 100% transparent, upfront fixed pricing. Unlike app aggregators that apply 2x-3x peak surge during rain, festivals, or midnight hours, our rates remain fixed with zero hidden charges."
    },
    {
      q: "Does PB08 TAXI provide airport drops from Jalandhar?",
      a: "Yes, we specialize in 24/7 direct airport transfers from Jalandhar to Delhi IGI Airport (DEL T1/T2/T3), Amritsar Airport (ATQ), and Chandigarh Airport (IXC) with guaranteed on-time doorstep pickup."
    },
    {
      q: "Which areas in Jalandhar do you cover for doorstep pickup?",
      a: "We provide 24/7 doorstep pickup across all Jalandhar localities including Model Town, BMC Chowk, Rama Mandi, PAP Chowk, Cantt Railway Station, City Railway Station, Guru Nanak Mission Chowk, Maqsudan, Phagwara Gate, Nakodar Road, Football Chowk, and surrounding rural Punjab towns."
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
            <span className="text-taxi-yellow">Jalandhar Taxi Service</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-taxi-yellow/15 border border-taxi-yellow/30 text-taxi-yellow text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>#1 Trusted Jalandhar Taxi Service (PB08)</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Jalandhar Taxi Service — 24/7 Verified Cabs in Punjab
              </h1>

              {/* Direct Answer GEO Box for AI & Snippets */}
              <div className="bg-zinc-900/90 border border-taxi-yellow/30 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-zinc-200 leading-relaxed space-y-2">
                <p>
                  <strong className="text-taxi-yellow">PB08 TAXI (pb08taxi.com)</strong> is Jalandhar's premier commercial taxi service network owned and directed by Pawan Kumar. Operating 24/7 from our central hub at Model Town near BMC Chowk, we provide instant one-way outstation drops, airport transfers, and verified local city cabs with fixed upfront pricing and zero surge fees.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400 font-semibold">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fixed Fares</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Police Verified Drivers</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Instant WhatsApp Dispatch</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenBooking('Jalandhar Taxi Hero CTA')}
                  className="px-8 py-4 bg-taxi-yellow text-black font-extrabold text-base rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-taxi-yellow/20 flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <Car className="w-5 h-5 stroke-[2.5]" />
                  <span>One Click Book Your Ride</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=Hi%20PB08%20TAXI,%20I%20need%20a%20taxi%20in%20Jalandhar`}
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

        {/* Pricing & Fleet Matrix */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Transparent Jalandhar Taxi Rates
            </h2>
            <p className="text-sm text-zinc-400">
              Clear per-kilometer and fixed package rates with zero surge charge guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sedan */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 hover:border-taxi-yellow/50 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Sedan Class</span>
                  <h3 className="text-xl font-black text-white mt-1">Maruti Dzire / Etios</h3>
                </div>
                <span className="text-lg font-black text-white bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800">
                  ₹11/km
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Ideal for 1-4 passengers with medium luggage. Ultra-smooth AC ride for city travel &amp; outstation drops.
              </p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-900">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>4 Passengers + 1 Driver</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dual Air Conditioning &amp; Boot Space</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero Return Fare on One-Way Drops</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => handleOpenBooking('Sedan Pricing Card')}
                className="w-full py-3 bg-zinc-900 hover:bg-taxi-yellow hover:text-black text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Book Sedan in Jalandhar
              </button>
            </div>

            {/* Premium SUV */}
            <div className="bg-zinc-950 border-2 border-taxi-yellow rounded-3xl p-6 space-y-4 shadow-xl shadow-taxi-yellow/10 relative">
              <div className="absolute -top-3 right-6 bg-taxi-yellow text-black text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Luxury SUV</span>
                  <h3 className="text-xl font-black text-white mt-1">Innova Crysta</h3>
                </div>
                <span className="text-lg font-black text-white bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800">
                  ₹16/km
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                The gold standard in highway luxury and safety. Captain seats, extra luggage room, and supreme comfort.
              </p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-900">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>6+1 / 7+1 Seating Capacities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Perfect for Airport &amp; Family Outstation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Highway Road Stability &amp; Sanitized Interior</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => handleOpenBooking('Innova Pricing Card')}
                className="w-full py-3 bg-taxi-yellow text-black text-xs font-extrabold rounded-xl hover:bg-yellow-400 transition-all cursor-pointer shadow-md"
              >
                Book Innova Crysta
              </button>
            </div>

            {/* MUV */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 hover:border-taxi-yellow/50 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Family MUV</span>
                  <h3 className="text-xl font-black text-white mt-1">Maruti Ertiga</h3>
                </div>
                <span className="text-lg font-black text-white bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800">
                  ₹13/km
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Economical 6-seater family taxi. Ample space for group luggage with supreme mileage and pocket-friendly fare.
              </p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-900">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>6 Passengers + 1 Driver</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Spacious Seating with Rear AC vents</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Best Price-to-Space Ratio</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => handleOpenBooking('Ertiga Pricing Card')}
                className="w-full py-3 bg-zinc-900 hover:bg-taxi-yellow hover:text-black text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Book Ertiga Taxi
              </button>
            </div>
          </div>
        </section>

        {/* Local Jalandhar Landmarks & Pickup Points */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">100% City Coverage</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                24/7 Doorstep Pickup Across All Jalandhar Locations
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl">
                Whether you need an early morning 3:00 AM pickup for Delhi airport or an instant evening cab from the railway station, our verified drivers reach your doorstep within 15-20 minutes:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs text-zinc-300">
              {[
                "Model Town",
                "BMC Chowk",
                "Rama Mandi",
                "PAP Chowk",
                "City Railway Station",
                "Cantt Railway Station",
                "Guru Nanak Mission Chowk",
                "Maqsudan",
                "Phagwara Gate",
                "Nakodar Road",
                "Football Chowk",
                "Ladowali Road",
                "Basti Nau & Basti Sheikh",
                "Urban Estate Phase 1 & 2",
                "Suranussi",
                "LPU Campus (Phagwara)"
              ].map((loc, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850">
                  <MapPin className="w-3.5 h-3.5 text-taxi-yellow flex-shrink-0" />
                  <span className="truncate">{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Questions About Jalandhar Taxi Service
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
