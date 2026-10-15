import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileCheck, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  UserCheck, 
  BadgeCheck, 
  Sparkles,
  BookOpen,
  Award,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import BookingModal from '../components/BookingModal';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function EditorialPolicyPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+919888079736';
  const whatsappNumber = settings?.whatsapp_number || '+919888079736';
  const cleanPhone = supportPhone.replace(/\D/g, '');
  const cleanWa = whatsappNumber.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Editorial Policy & Publishing Standards — ${brandTitle}`;
  }, [brandTitle]);

  return (
    <div className="min-h-screen bg-taxi-black text-white flex flex-col font-sans selection:bg-taxi-yellow selection:text-black">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation Breadcrumb */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-taxi-yellow transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Header */}
          <div className="border-b border-zinc-800 pb-8 mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-taxi-yellow/10 border border-taxi-yellow/30 text-taxi-yellow text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Content Integrity & Publishing Standards</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Editorial Policy & Transportation Integrity
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              At {brandTitle}, accuracy, transparency, and passenger safety guide every piece of travel information, route guide, fare calculation, and safety advisory published across our platform.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-400 bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-850">
              <span className="flex items-center space-x-1.5 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-taxi-yellow" />
                <span>Effective Date: <strong>October 15, 2026</strong></span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center space-x-1.5 text-zinc-300">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Published by: <strong>{brandTitle} Operations Editorial Board</strong></span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">Jurisdiction: <strong>Jalandhar, Punjab, India</strong></span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
            
            {/* Section 1 */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 sm:p-8 rounded-3xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Our Mission & Purpose</h2>
              </div>
              <p>
                {brandTitle} operates as a licensed commercial taxi network based in Jalandhar, Punjab. Our editorial mission is to provide Punjab residents, domestic commuters, business travelers, and international NRI visitors with verified, up-to-date travel guidance, transparent fixed fares, and highway safety insights.
              </p>
              <p>
                We do not publish sponsored third-party advertorials or deceptive clickbait fare estimates. Every route guide and travel estimate is vetted by real dispatchers who oversee highway operations daily.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 sm:p-8 rounded-3xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Fare Transparency & Pricing Verification</h2>
              </div>
              <p>
                All route pricing displayed on {brandTitle} reflects actual, standardized commercial taxi rates:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
                <li><strong>All-Inclusive Estimates:</strong> Base quotes clearly explain what is covered, including vehicle type, driver allowance, and route distance.</li>
                <li><strong>Transparent Tolls & Taxes:</strong> Outstation state entry taxes (such as Himachal Green Tax) and FASTag toll plazas are explained upfront with zero hidden surcharges.</li>
                <li><strong>No Surge Inflation:</strong> Unlike algorithm-driven rideshare apps that double prices during rainfall or festive rushes, our rates remain fair and predictable.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 sm:p-8 rounded-3xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Route Accuracy & Highway Timings</h2>
              </div>
              <p>
                Our driving time estimates (such as Jalandhar to Delhi IGI Airport in 6.5 hours or Jalandhar to Amritsar Airport in 1.5 hours) are calculated using verified highway telemetry, real-time FASTag lane speeds, and national highway conditions (NH44, NH3).
              </p>
              <p>
                During winter fog seasons or road maintenance diversions, dispatchers actively communicate adjusted schedule recommendations to ensure passengers never miss connecting flights.
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 sm:p-8 rounded-3xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Chauffeur Safety & Fleet Standards</h2>
              </div>
              <p>
                Every driver profile featured in our fleet has met our stringent 4-tier verification protocol:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                  <strong className="text-taxi-yellow block mb-1">Police Background Screening</strong>
                  Verification of identity, residential proof, and clean criminal record check.
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                  <strong className="text-taxi-yellow block mb-1">Commercial Transport Badge</strong>
                  Valid commercial driving license with at least 5+ years of highway driving experience.
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                  <strong className="text-taxi-yellow block mb-1">Vehicle Fitness & Inspection</strong>
                  Routine mechanical fitness, tire checks, and functional dual air-conditioning.
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                  <strong className="text-taxi-yellow block mb-1">Zero-Tolerance Safety Code</strong>
                  Strict non-smoking, polite etiquette, and mandatory speed governor compliance.
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 sm:p-8 rounded-3xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Corrections, Queries & Contact Information</h2>
              </div>
              <p>
                We welcome community feedback. If you discover any route information, highway advisory, or contact detail that requires updating, our editorial and fleet dispatch team will review and rectify it within 24 hours.
              </p>
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                <p><strong>Editorial Desk:</strong> {brandTitle} Transport Operations</p>
                <p><strong>Central Hub:</strong> {settings?.physical_address || 'Model Town, Near BMC Chowk, Jalandhar, Punjab 144001, India'}</p>
                <p><strong>Phone:</strong> <a href={`tel:${cleanPhone}`} className="text-taxi-yellow hover:underline">{supportPhone}</a></p>
                <p><strong>WhatsApp Support:</strong> <a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">{whatsappNumber}</a></p>
              </div>
            </div>

          </div>

          {/* Quick CTA Box */}
          <div className="mt-12 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Ready for a Smooth Journey?</h3>
              <p className="text-xs text-zinc-400">Experience punctual, air-conditioned taxi service with fixed rates.</p>
            </div>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-taxi-yellow/20 flex-shrink-0"
            >
              Book Cab Now
            </button>
          </div>

        </div>
      </main>

      <Footer onOpenBooking={() => setIsBookingOpen(true)} />
      <FloatingWhatsApp />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
}
