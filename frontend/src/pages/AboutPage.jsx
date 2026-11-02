import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Car, 
  ArrowLeft, 
  Sparkles,
  HeartHandshake,
  Navigation,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { updatePageMeta } from '../utils/seo';
import { trackPageView } from '../utils/analytics';

const BookingModal = React.lazy(() => import('../components/BookingModal'));

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+91 98880 79736';
  const whatsappNumber = settings?.whatsapp_number || '+91 98880 79736';
  const cleanPhone = supportPhone.replace(/\D/g, '');
  const cleanWa = whatsappNumber.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/about');

    updatePageMeta({
      title: `About Us — ${brandTitle} | Punjab's Trusted 24/7 Taxi & Airport Cab Service`,
      description: `Learn about ${brandTitle} — Punjab's premier 24/7 chauffeur service founded by Pawan Kumar in Jalandhar. 12+ years highway experience, verified drivers & fixed fares.`,
      canonicalUrl: 'https://www.pb08taxi.com/about',
      keywords: 'about pb08 taxi, taxi service jalandhar, punjab cab service, pawan kumar taxi, airport taxi punjab, verified drivers jalandhar'
    });

    // Injected AboutPage Schema
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": `About ${brandTitle}`,
      "url": "https://www.pb08taxi.com/about",
      "description": `Official About page of ${brandTitle}, Punjab's premier 24/7 commercial passenger transport service based in Jalandhar.`,
      "mainEntity": {
        "@type": "TaxiService",
        "name": brandTitle,
        "url": "https://www.pb08taxi.com/",
        "telephone": supportPhone,
        "priceRange": "₹₹",
        "areaServed": "Punjab, Delhi NCR, Himachal Pradesh, Jammu & Kashmir, India",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Model Town, Near BMC Chowk",
          "addressLocality": "Jalandhar",
          "addressRegion": "Punjab",
          "postalCode": "144001",
          "addressCountry": "IN"
        },
        "founder": {
          "@type": "Person",
          "name": "Pawan Kumar",
          "jobTitle": "Owner & Fleet Operations Director",
          "description": "Founder and director of PB08 TAXI with 12+ years of commercial passenger highway transport experience in Punjab."
        }
      }
    };

    let scriptTag = document.getElementById('schema-about-page');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-about-page';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById('schema-about-page');
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
            <span className="text-zinc-200">Company</span>
            <span>/</span>
            <span className="text-taxi-yellow">About Us</span>
          </div>

          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-8 sm:p-12 lg:p-16 mb-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-taxi-yellow/10 border border-taxi-yellow/30 text-taxi-yellow text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Punjab's Premier Chauffeur Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                About <span className="text-taxi-yellow">{brandTitle}</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                Founded with a mission to eliminate uncertainty from outstation and airport travel in Punjab, 
                <strong className="text-white"> {brandTitle}</strong> has evolved into Jalandhar's most reputable 24/7 
                taxi network — offering fixed upfront pricing, polite commercial drivers, and zero-cancellation reliability.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-taxi-yellow text-black font-bold text-sm hover:bg-yellow-400 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-taxi-yellow/20 flex items-center space-x-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Book Your Ride Now</span>
                </button>
                <a
                  href={`tel:${cleanPhone}`}
                  className="px-6 py-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white font-semibold text-sm transition-all border border-zinc-700 flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4 text-taxi-yellow" />
                  <span>Call Operations Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
              <div className="text-3xl sm:text-4xl font-black text-taxi-yellow mb-1">12+</div>
              <div className="text-xs sm:text-sm text-zinc-400 font-medium">Years Serving Punjab</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">50,000+</div>
              <div className="text-xs sm:text-sm text-zinc-400 font-medium">Successful Trips</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
              <div className="text-3xl sm:text-4xl font-black text-taxi-yellow mb-1">100%</div>
              <div className="text-xs sm:text-sm text-zinc-400 font-medium">Verified Drivers</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-zinc-400 font-medium">Live Dispatch Desk</div>
            </div>
          </div>

          {/* Founder & Leadership Section (E-E-A-T Pillar) */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-12 mb-16">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4">
                <div className="aspect-square rounded-2xl bg-gradient-to-tr from-zinc-800 via-zinc-850 to-zinc-700 border border-zinc-750 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-taxi-yellow/10 border-2 border-taxi-yellow flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-taxi-yellow" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Pawan Kumar</h3>
                  <p className="text-xs font-semibold text-taxi-yellow mt-0.5">Founder &amp; Fleet Operations Director</p>
                  <p className="text-[11px] text-zinc-400 mt-2 font-mono">12+ Yrs Commercial Transport</p>
                  <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-800 text-[10px] text-zinc-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Commercial Transport Certified</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-taxi-yellow uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Founder's Message &amp; Vision</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  "Safe highway travel starts with respect, punctuality, and zero hidden surprises."
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  When I started PB08 TAXI in Jalandhar over a decade ago, travelers frequently faced unannounced midnight surge prices, 
                  unverified drivers, and cancellations right before critical flights at Delhi or Amritsar Airport. 
                </p>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  We built PB08 TAXI on a simple promise: <strong className="text-white">when you book a cab with us, your driver arrives on time, 
                  your fare remains exactly what was promised, and your safety is managed round-the-clock</strong> by a local team right here in Model Town, Jalandhar.
                </p>
              </div>
            </div>
          </div>

          {/* Core Values / Why Choose Us Grid */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Our 4 Core Operating Principles</h2>
              <p className="text-sm text-zinc-400">Everything we do is designed to give you peace of mind whether traveling at 2 PM or 3 AM.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-taxi-yellow/10 border border-taxi-yellow/20 flex items-center justify-center text-taxi-yellow mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">1. Verified Commercial Chauffeurs</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  We don't operate random gig driver apps. Every chauffeur on our roster is personally vetted, holds a commercial passenger badge, 
                  and has documented highway experience across NH44, GT Road, and hill state highways.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-taxi-yellow/10 border border-taxi-yellow/20 flex items-center justify-center text-taxi-yellow mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">2. Fixed Upfront Fares — No Hidden Charges</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Pay only for what you travel. For one-way outstation drops, you never pay return dead-mileage fares. All toll and state permit charges 
                  are discussed upfront with 100% billing transparency.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-taxi-yellow/10 border border-taxi-yellow/20 flex items-center justify-center text-taxi-yellow mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">3. Guaranteed Punctuality &amp; Flight Tracking</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  For airport drops to Delhi IGI, Amritsar ATQ, and Chandigarh IXC, our dispatch team actively monitors live traffic and flight schedules 
                  to ensure your vehicle arrives at your doorstep well ahead of time.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-taxi-yellow/10 border border-taxi-yellow/20 flex items-center justify-center text-taxi-yellow mb-4">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">4. Well-Maintained, AC Modern Fleet</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Choose from clean Sedans (Dzire, Etios), versatile family SUVs (Ertiga, XL6), and executive luxury vehicles (Innova Crysta). 
                  Every car is cleaned and sanitized before every highway dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Central Hub & Local Verification */}
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 p-8 sm:p-12 mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-taxi-yellow uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Central Operations Hub</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Rooted in Model Town, Jalandhar</h2>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  PB08 TAXI maintains its dispatch headquarters right in the heart of Jalandhar near BMC Chowk. Our local dispatchers 
                  coordinate vehicles 24 hours a day, 365 days a year across Punjab.
                </p>
                <div className="pt-2 space-y-2 text-xs sm:text-sm text-zinc-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-taxi-yellow flex-shrink-0" />
                    <span>Model Town, Near BMC Chowk, Jalandhar, Punjab 144001, India</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-taxi-yellow flex-shrink-0" />
                    <a href={`tel:${cleanPhone}`} className="hover:text-taxi-yellow font-semibold">{supportPhone}</a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-taxi-yellow flex-shrink-0" />
                    <span>Open 24 Hours, 7 Days a Week (Including Holidays)</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 space-y-4 text-center">
                <h3 className="text-lg font-bold text-white">Need an Instant Outstation or Airport Cab?</h3>
                <p className="text-xs text-zinc-400">Speak directly with our Jalandhar highway dispatch desk.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a
                    href={`https://wa.me/${cleanWa}?text=Hello%20PB08%20TAXI,%20I%20would%20like%20to%20book%20a%20cab.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Booking Desk</span>
                  </a>
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="px-5 py-3 rounded-xl bg-taxi-yellow hover:bg-yellow-400 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Car className="w-4 h-4" />
                    <span>Instant Online Booking</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Floating WhatsApp Quick Action */}
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
