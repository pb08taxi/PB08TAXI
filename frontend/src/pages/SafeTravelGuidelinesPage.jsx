import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  Car, 
  MapPin, 
  AlertTriangle,
  HeartHandshake,
  UserCheck,
  Moon,
  Mountain,
  FileCheck,
  Award,
  Plane,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import BookingModal from '../components/BookingModal';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function SafeTravelGuidelinesPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+919888079736';
  const whatsappNumber = settings?.whatsapp_number || '+919888079736';
  const cleanPhone = supportPhone.replace(/\D/g, '');
  const cleanWa = whatsappNumber.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Safe Travel Guidelines — ${brandTitle} | Passenger Safety & Driver Verification`;
  }, [brandTitle]);

  const handleOpenBooking = () => setIsBookingOpen(true);
  const handleCloseBooking = () => setIsBookingOpen(false);

  const guidelines = [
    {
      icon: UserCheck,
      title: "1. 100% Commercial Driver Verification",
      color: "text-taxi-yellow",
      bg: "bg-taxi-yellow/10",
      points: [
        "Every chauffeur holds a valid commercial passenger transport driver's license with clean traffic history.",
        "Verified police background checks and identity verification filed with our central dispatch desk in Jalandhar.",
        "Over 5+ years of verified highway driving experience across NH44, GT Road, and challenging Himalayan terrain."
      ]
    },
    {
      icon: ShieldCheck,
      title: "2. Vehicle Fitness & Sanitization Standards",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      points: [
        "Thorough interior cabin cleaning, vacuuming, and dashboard sanitization performed prior to every departure.",
        "Mandatory 50-point mechanical inspection covering brakes, tyres, headlights, AC cooling, and emergency toolkits.",
        "Up-to-date state commercial road permits, comprehensive passenger liability insurance, and pollution certificates."
      ]
    },
    {
      icon: Moon,
      title: "3. Night Travel & Female Passenger Safety",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      points: [
        "Live 24/7 route tracking and driver monitoring from our Jalandhar central control desk on all night journeys.",
        "Driver contact card (driver photo, phone number, vehicle plate number) transmitted to customer via WhatsApp before dispatch.",
        "Direct family-sharing feature: easily forward your live WhatsApp booking receipt and driver contact to loved ones."
      ]
    },
    {
      icon: Mountain,
      title: "4. Hill Station & Mountain Safety Protocols",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      points: [
        "Specialized mountain-trained chauffeurs for high-altitude routes (Manali, Shimla, Dharamshala, Katra, Dalhousie).",
        "Strict adherence to mountain speed caps, zero dangerous overtaking on blind curves, and mandatory fog-lamp safety.",
        "Regular brake-pad and coolant inspections before commencing steep incline and descent ascents."
      ]
    },
    {
      icon: FileCheck,
      title: "5. Transparent Fares & Zero Return Surges",
      color: "text-taxi-yellow",
      bg: "bg-taxi-yellow/10",
      points: [
        "Guaranteed one-way tariff: you only pay for the distance travelled without paying return dead-mileage fares.",
        "State border entry permits, highway toll plazas (FASTag), and airport parking fees charged strictly on actual receipts.",
        "Multiple hassle-free payment methods: Cash to driver or direct UPI (Google Pay, PhonePe, Paytm, BHIM)."
      ]
    },
    {
      icon: HeartHandshake,
      title: "6. Passenger Courtesy & Lost Property Protocol",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      points: [
        "Polite, non-intrusive chauffeurs trained in professional guest hospitality and luggage loading assistance.",
        "Immediate Lost & Found assistance: if you leave a bag or phone behind, call our 24/7 hotline for immediate driver dispatch retrieval.",
        "Zero smoking, zero alcohol, and mandatory seatbelts for all passengers in compliance with the Motor Vehicles Act."
      ]
    },
    {
      icon: MapPin,
      title: "7. Doorstep Live GPS Pickup & Exact Navigation",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      points: [
        "One-tap 'Use Current Location' captures precise GPS coordinates (latitude, longitude), generating a live Google Maps pin for your chauffeur.",
        "Eliminates frustrating landmark confusion and unnecessary phone calls in dense residential colonies, mohallas, and market areas.",
        "Live driver arrival tracking: your assigned chauffeur reaches right where you stand with zero delay."
      ]
    },
    {
      icon: Plane,
      title: "8. Airport Flight Tracking & Meet-and-Greet",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      points: [
        "Real-time flight arrival tracking at Amritsar (ATQ), Delhi IGI (DEL T1/T2/T3), and Chandigarh (IXC) airports.",
        "Zero extra waiting surcharges for verified flight delays — your cab is guaranteed to wait until you exit the terminal.",
        "Designated terminal arrivals coordination with luggage assistance and direct driver contact via WhatsApp."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-taxi-yellow selection:text-black">
      {/* Navigation */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero Header */}
      <div className="relative pt-28 pb-16 bg-gradient-to-b from-zinc-900/80 via-black to-black border-b border-zinc-850 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-6 font-medium">
            <Link to="/" className="hover:text-taxi-yellow flex items-center space-x-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-200">Legal &amp; Trust</span>
            <span>/</span>
            <span className="text-taxi-yellow">Safe Travel Guidelines</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Your Safety Is Our #1 Commitment</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Safe Travel Guidelines
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Discover the rigorous safety standards, vehicle checks, driver background verification, and 24/7 support protocols behind every <strong className="text-white">{brandTitle}</strong> journey.
              </p>
            </div>

            {/* Quick Badge Card */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex-shrink-0 text-xs space-y-1.5 shadow-xl">
              <div className="text-zinc-400 font-medium">
                Standard: <strong className="text-white">Motor Vehicles Act (Govt. of India)</strong>
              </div>
              <div className="text-zinc-400 font-medium">
                Helpline: <strong className="text-taxi-yellow">24/7 Active Dispatch Desk</strong>
              </div>
              <div className="text-emerald-400 font-semibold flex items-center space-x-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GPS &amp; WhatsApp Tracked Rides</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* 6 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guidelines.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div 
                key={idx} 
                className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-7 space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                  <div className={`w-10 h-10 rounded-xl ${g.bg} ${g.color} flex items-center justify-center font-bold flex-shrink-0`}>
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {g.title}
                  </h2>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-300">
                  {g.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start space-x-2.5">
                      <CheckCircle2 className={`w-4 h-4 ${g.color} mt-0.5 flex-shrink-0`} />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Emergency Assistance Hotline Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-taxi-yellow bg-taxi-yellow/10 border border-taxi-yellow/20 px-3 py-1 rounded-full">
              <Phone className="w-3.5 h-3.5" />
              <span>24/7 Passenger Support Line</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Need Live Travel Help or Immediate Assistance?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Our round-the-clock dispatch desk in Jalandhar is available 24 hours a day, 7 days a week for booking changes, route guidance, and lost property recovery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <a
              href={`tel:${cleanPhone}`}
              className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-taxi-yellow/20 flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {supportPhone}</span>
            </a>
            <button
              onClick={handleOpenBooking}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all border border-zinc-700 text-center"
            >
              One Click Book Ride
            </button>
          </div>
        </div>

        {/* Navigation back to Legal docs */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-900">
          <Link to="/privacy-policy" className="hover:text-taxi-yellow flex items-center space-x-1 transition-colors">
            <span>← Privacy Policy</span>
          </Link>
          <Link to="/terms-of-service" className="hover:text-taxi-yellow flex items-center space-x-1 transition-colors">
            <span>Terms of Service →</span>
          </Link>
        </div>

      </div>

      {/* Footer */}
      <Footer onOpenBooking={handleOpenBooking} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp onOpenBooking={handleOpenBooking} />

      {/* One Click Book Your Ride Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
}
