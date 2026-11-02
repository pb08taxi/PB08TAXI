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
  ArrowLeftRight,
  TrendingDown,
  BadgePercent
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackPageView, trackModalOpen } from '../utils/analytics';

const BookingModal = React.lazy(() => import('../components/BookingModal'));

export default function OneWayTaxiPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+91 98880 79736';
  const cleanPhone = supportPhone.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `One Way Taxi Service Jalandhar — Zero Return Fare Cab Drops | ${brandTitle}`;
    trackPageView('/one-way-taxi-service');

    // Dynamic Schema Injection for One Way Taxi Service
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "TaxiService",
      "name": "One Way Taxi Service Jalandhar - PB08 TAXI",
      "alternateName": [
        "One Way Taxi Service",
        "One Way Taxi Service Jalandhar",
        "One Way Cab Service Jalandhar",
        "One Way Jalandhar",
        "One Way Taxi Punjab",
        "PB08 Taxi One Way"
      ],
      "url": "https://www.pb08taxi.com/one-way-taxi-service",
      "telephone": supportPhone,
      "priceRange": "₹₹",
      "areaServed": [
        "Jalandhar",
        "Delhi",
        "Chandigarh",
        "Amritsar",
        "Ludhiana",
        "Hoshiarpur",
        "Punjab"
      ],
      "description": "Book 24/7 one-way taxi service from Jalandhar to Delhi, Chandigarh, Amritsar, and all North India with zero return dead-mileage charges.",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "487"
      }
    };

    let scriptTag = document.getElementById('schema-oneway-taxi');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-oneway-taxi';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById('schema-oneway-taxi');
      if (el) el.remove();
    };
  }, [brandTitle, supportPhone]);

  const handleOpenBooking = (source = 'One Way Taxi Page') => {
    trackModalOpen(typeof source === 'string' ? source : 'One Way Taxi Page');
    setIsBookingOpen(true);
  };

  const ONE_WAY_ROUTES = [
    {
      route: "Jalandhar ⇄ Delhi (IGI Airport / City)",
      distance: "375 km",
      time: "6–7 Hours",
      sedanPrice: "From ₹3,999",
      suvPrice: "From ₹5,499",
      benefit: "Save up to ₹3,500 over traditional two-way return taxis"
    },
    {
      route: "Jalandhar ⇄ Chandigarh / Mohali / IXC Airport",
      distance: "150 km",
      time: "2.5 Hours",
      sedanPrice: "From ₹1,899",
      suvPrice: "From ₹2,799",
      benefit: "Express highway drop for PGI, airport, or IT city"
    },
    {
      route: "Jalandhar ⇄ Amritsar / Sri Harmandir Sahib",
      distance: "85 km",
      time: "1.5 Hours",
      sedanPrice: "From ₹1,199",
      suvPrice: "From ₹1,799",
      benefit: "Doorstep pickup for Golden Temple or ATQ airport drop"
    },
    {
      route: "Jalandhar ⇄ Ludhiana City",
      distance: "62 km",
      time: "1 Hour",
      sedanPrice: "From ₹899",
      suvPrice: "From ₹1,399",
      benefit: "Rapid industrial hub express connection via NH44"
    },
    {
      route: "Jalandhar ⇄ Shimla / Manali / Dharamshala",
      distance: "230–330 km",
      time: "5–8 Hours",
      sedanPrice: "From ₹3,499",
      suvPrice: "From ₹4,999",
      benefit: "Specialist mountain drivers for safe hill-station transit"
    },
    {
      route: "Jalandhar ⇄ Jammu / Katra (Vaishno Devi)",
      distance: "270 km",
      time: "5.5 Hours",
      sedanPrice: "From ₹3,699",
      suvPrice: "From ₹4,899",
      benefit: "Spiritual pilgrimage drops with luggage carrier"
    }
  ];

  const FAQS = [
    {
      q: "What is One Way Taxi Service and how does it save money?",
      a: "Traditional outstation taxi operators charge you for both ways (pickup to destination + empty return trip). With PB08 TAXI's dedicated One Way Taxi Service, you pay exclusively for the kilometers travelled to your destination. You never pay for the empty return journey, saving 40% to 50% on every trip."
    },
    {
      q: "Are toll taxes and state border permits included?",
      a: "Our one-way taxi fares are 100% transparent. Fuel, driver allowance, and vehicle charges are fixed. Highway toll taxes and state road permits are charged on actuals or can be bundled into an all-inclusive fixed package upon request."
    },
    {
      q: "Can I book a one-way taxi from Delhi or Chandigarh to Jalandhar?",
      a: "Yes! PB08 TAXI provides bidirectional one-way drops. You can book from Jalandhar to outstation cities, or book a return cab from Delhi IGI Airport, Chandigarh, or Amritsar directly back to your home in Jalandhar."
    },
    {
      q: "Is advance payment required for one-way cab bookings?",
      a: "No! We do not ask for mandatory advance payments. You can book your cab online or via WhatsApp, verify your car and driver details beforehand, and pay the chauffeur directly via Cash, UPI, Google Pay, or PhonePe upon reaching your destination."
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
            <span className="text-taxi-yellow">One Way Taxi Service</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-taxi-yellow/15 border border-taxi-yellow/30 text-taxi-yellow text-xs font-bold uppercase tracking-wider">
                <BadgePercent className="w-4 h-4" />
                <span>Zero Return Fare Guarantee • Save 40%–50%</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                One Way Taxi Service Jalandhar — Pay Only One-Side Fare
              </h1>

              {/* Direct Answer GEO Box */}
              <div className="bg-zinc-900/90 border border-taxi-yellow/30 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-zinc-200 leading-relaxed space-y-2">
                <p>
                  Looking for reliable <strong className="text-taxi-yellow">One Way Taxi Service in Jalandhar</strong>? PB08 TAXI offers dedicated single-sided cab drops to Delhi IGI Airport, Chandigarh, Amritsar, Ludhiana, Himachal, and across North India. You only pay for your journey to the destination — zero return dead-mileage charges, verified police-checked chauffeurs, and 24/7 on-demand dispatch.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400 font-semibold">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>No Empty Return Charges</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Instant Doorstep Pickup</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GPS Navigation Linked</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenBooking('One Way Taxi Hero CTA')}
                  className="px-8 py-4 bg-taxi-yellow text-black font-extrabold text-base rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-taxi-yellow/20 flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <Car className="w-5 h-5 stroke-[2.5]" />
                  <span>Book One Way Cab Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=Hi%20PB08%20TAXI,%20I%20want%20to%20book%20a%20One%20Way%20Taxi`}
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

        {/* Comparison: Traditional Cab vs PB08 One-Way */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">Direct Cost Comparison</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Why Pay For The Return When You Aren't Coming Back?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Traditional Cabs */}
              <div className="bg-zinc-900/40 border border-red-500/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                  <span>❌ Traditional / Local Travel Operators</span>
                </div>
                <ul className="text-xs sm:text-sm text-zinc-400 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>Charges you for <strong>both sides</strong> (e.g. 750 km for a 375 km Jalandhar to Delhi trip).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>High minimum daily kilometer penalties (250km/day or 300km/day).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>Total Delhi trip cost: <strong>₹7,500 – ₹8,500</strong>.</span>
                  </li>
                </ul>
              </div>

              {/* PB08 TAXI One-Way */}
              <div className="bg-zinc-900/80 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-lg shadow-emerald-500/5">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <span>✅ PB08 TAXI One Way Service</span>
                </div>
                <ul className="text-xs sm:text-sm text-zinc-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Pay <strong>ONLY</strong> for the one-side route you travel. Zero return mileage.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>No night driver penalty or arbitrary surge charges.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Total Delhi trip cost: <strong>From ₹3,999 Flat</strong> (Direct ₹3,500+ Savings!).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Popular One-Way Routes Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Popular One-Way Cab Routes from Jalandhar
            </h2>
            <p className="text-sm text-zinc-400">
              Fixed rate one-way drops across Punjab, Delhi NCR, and North India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ONE_WAY_ROUTES.map((item, idx) => (
              <div
                key={idx}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-taxi-yellow/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{item.route}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.distance} • {item.time}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-taxi-yellow block">{item.sedanPrice}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Sedan (Dzire)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                  <span className="text-zinc-400">{item.benefit}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(`One Way: ${item.route}`)}
                    className="text-taxi-yellow hover:text-yellow-400 font-bold inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">One Way FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Questions About One Way Taxi Service
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
