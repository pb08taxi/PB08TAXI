import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  Car, 
  MapPin, 
  AlertTriangle,
  CreditCard,
  Ban,
  Briefcase,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import BookingModal from '../components/BookingModal';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function TermsOfServicePage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+919876543210';
  const whatsappNumber = settings?.whatsapp_number || '+919876543210';
  const cleanPhone = supportPhone.replace(/\D/g, '');
  const cleanWa = whatsappNumber.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Terms of Service — ${brandTitle} | Fair & Transparent Cab Guidelines`;
  }, [brandTitle]);

  const handleOpenBooking = () => setIsBookingOpen(true);
  const handleCloseBooking = () => setIsBookingOpen(false);

  const sections = [
    { id: 'agreement', label: '1. Agreement & Acceptance' },
    { id: 'services', label: '2. Transportation Services' },
    { id: 'booking-policy', label: '3. Booking & Confirmation' },
    { id: 'pricing-payments', label: '4. Fares, Tolls & Payments' },
    { id: 'cancellation', label: '5. Cancellations & Rescheduling' },
    { id: 'passenger-conduct', label: '6. Passenger Conduct & Safety' },
    { id: 'luggage-policy', label: '7. Luggage & Vehicle Capacity' },
    { id: 'driver-standards', label: '8. Fleet & Driver Standards' },
    { id: 'lost-found', label: '9. Lost & Found Property' },
    { id: 'liability-jurisdiction', label: '10. Liability & Jurisdiction' }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-taxi-yellow selection:text-black">
      {/* Navigation */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero Header */}
      <div className="relative pt-28 pb-16 bg-gradient-to-b from-zinc-900/80 via-black to-black border-b border-zinc-850 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-6 font-medium">
            <Link to="/" className="hover:text-taxi-yellow flex items-center space-x-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-200">Legal & Trust</span>
            <span>/</span>
            <span className="text-taxi-yellow">Terms of Service</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-taxi-yellow/10 border border-taxi-yellow/30 text-taxi-yellow text-xs font-bold uppercase tracking-wider mb-3">
                <Scale className="w-3.5 h-3.5" />
                <span>Fair & Transparent Travel Terms</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Terms of Service
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Welcome to <strong className="text-white">{brandTitle}</strong>. Please review these terms governing your taxi bookings, airport transfers, fare calculations, and passenger rights.
              </p>
            </div>

            {/* Quick Badge Card */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex-shrink-0 text-xs space-y-1.5 shadow-xl">
              <div className="text-zinc-400 font-medium">
                Last Updated: <strong className="text-white">January 2026</strong>
              </div>
              <div className="text-zinc-400 font-medium">
                Jurisdiction: <strong className="text-taxi-yellow">Jalandhar, Punjab, India</strong>
              </div>
              <div className="text-emerald-400 font-semibold flex items-center space-x-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Commercial Verified Drivers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 bg-zinc-950 border border-zinc-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-taxi-yellow flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Table of Contents</span>
              </h3>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 py-1.5 px-2.5 rounded-lg transition-colors leading-relaxed"
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-zinc-850">
                <p className="text-[11px] text-zinc-500 mb-2">Have questions about tariffs or rules?</p>
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-zinc-900 hover:bg-taxi-yellow hover:text-black border border-zinc-800 hover:border-taxi-yellow text-xs font-bold py-2 px-3 rounded-xl transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 24/7 Helpline</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Legal Document Sections */}
          <main className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-zinc-300">

            {/* Quick Commitments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white">Transparent Pricing</h4>
                <p className="text-[11px] text-zinc-400">
                  Fixed quotes and per-km pricing with toll and tax breakdowns. Zero surprise surges at destination.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white">On-Time Guarantee</h4>
                <p className="text-[11px] text-zinc-400">
                  Early airport and railway pickups with live driver coordination and backup vehicles ready.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white">Verified Drivers</h4>
                <p className="text-[11px] text-zinc-400">
                  All fleet drivers hold commercial transport badges, background checks, and route expertise.
                </p>
              </div>
            </div>

            {/* Section 1: Agreement */}
            <section id="agreement" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  01
                </div>
                <h2 className="text-lg font-black text-white">1. Agreement & Acceptance of Terms</h2>
              </div>
              <p>
                These Terms of Service constitute a legally binding agreement between you ("Passenger," "Customer," or "User") and <strong className="text-white">{brandTitle}</strong> ("we," "us," or "our").
              </p>
              <p>
                By booking a cab through our online portal, contacting our dispatch team via WhatsApp, calling our telephone helpline, or boarding a <strong className="text-white">{brandTitle}</strong> fleet vehicle, you agree to comply with and be bound by these terms. If you do not agree with any part of these terms, please refrain from using our booking services.
              </p>
            </section>

            {/* Section 2: Services */}
            <section id="services" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  02
                </div>
                <h2 className="text-lg font-black text-white">2. Transportation Services Provided</h2>
              </div>
              <p>
                <strong className="text-white">{brandTitle}</strong> operates a commercial passenger transport network offering:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <li className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-taxi-yellow mt-0.5 flex-shrink-0" />
                  <span><strong>Airport Transfers:</strong> Dedicated pickups & drops to Amritsar (ATQ), Chandigarh (IXC), and Delhi IGI Airport (DEL).</span>
                </li>
                <li className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-taxi-yellow mt-0.5 flex-shrink-0" />
                  <span><strong>Intercity Outstation Cabs:</strong> One-way and round-trip transfers across Punjab, Haryana, Delhi NCR, and Himachal Pradesh.</span>
                </li>
                <li className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-taxi-yellow mt-0.5 flex-shrink-0" />
                  <span><strong>Local City Cabs:</strong> Hourly rental, local shopping, and station drop services in Jalandhar and adjoining districts.</span>
                </li>
                <li className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-taxi-yellow mt-0.5 flex-shrink-0" />
                  <span><strong>Fleet Categories:</strong> Compact Sedans (Dzire, Etios), Executive Cabs, and 6/7-Seater Premium SUVs (Innova Crysta, Ertiga).</span>
                </li>
              </ul>
            </section>

            {/* Section 3: Booking & Confirmation */}
            <section id="booking-policy" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  03
                </div>
                <h2 className="text-lg font-black text-white">3. Booking & Confirmation Protocol</h2>
              </div>
              <p>
                Submitting a ride reservation request through our website generates a priority booking ticket:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                <li><strong>Booking Reference:</strong> Every reservation receives a unique system ID (e.g. #PB08-1024) sent via instant WhatsApp message.</li>
                <li><strong>Driver Assignment:</strong> A commercial taxi and driver are assigned in advance of your scheduled pickup date and time. Details including Driver Name, Contact Number, Taxi Registration Number, and Car Model are shared with the passenger.</li>
                <li><strong>Information Accuracy:</strong> The passenger is responsible for providing an accurate pickup address, reachable WhatsApp/mobile number, and scheduled timing (including flight flight numbers for airport pickups).</li>
              </ul>
            </section>

            {/* Section 4: Pricing & Payments */}
            <section id="pricing-payments" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  04
                </div>
                <h2 className="text-lg font-black text-white">4. Fares, Tolls, Taxes & Payment Methods</h2>
              </div>
              <p>
                We believe in total transparency without hidden post-ride charges:
              </p>
              <div className="space-y-2 text-xs bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-start space-x-2">
                  <span className="text-taxi-yellow font-bold">•</span>
                  <span><strong>Base Tariff:</strong> Quoted either as an all-inclusive flat airport package or based on actual route distance (minimum per-day km limit applies for outstation round trips).</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-taxi-yellow font-bold">•</span>
                  <span><strong>Tolls, Border Taxes & Parking:</strong> State border entry permits, highway FASTag toll plaza charges, and airport parking fees are payable as actuals unless explicitly bundled in an all-inclusive quote.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-taxi-yellow font-bold">•</span>
                  <span><strong>Accepted Payment Modes:</strong> Direct Cash to driver upon journey completion, or instant digital UPI (Google Pay, PhonePe, Paytm, BHIM) to our driver or business account.</span>
                </div>
              </div>
            </section>

            {/* Section 5: Cancellations */}
            <section id="cancellation" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  05
                </div>
                <h2 className="text-lg font-black text-white">5. Cancellations & Rescheduling Policy</h2>
              </div>
              <p>
                We understand that travel plans and flights can change. Our cancellation rules are designed to be fair to both passengers and dedicated drivers:
              </p>
              <ul className="space-y-2 text-xs">
                <li className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl text-emerald-300">
                  <strong>✓ Free Cancellation Window:</strong> You can cancel or reschedule your ride with zero penalty by notifying our dispatch team via phone or WhatsApp at least <strong>3 hours</strong> before scheduled pickup (or 6 hours for outstation round trips).
                </li>
                <li className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-zinc-300">
                  <strong>Flight Delays:</strong> For airport pickups, flight delays do not incur cancellation charges provided the passenger updates our helpline with the revised flight arrival time.
                </li>
                <li className="bg-red-950/20 border border-red-800/40 p-3 rounded-xl text-red-300">
                  <strong>Last-Minute Cancellation:</strong> If a booking is cancelled after the assigned vehicle has already reached your pickup location, a nominal dry-run fuel allowance may be charged to compensate the driver.
                </li>
              </ul>
            </section>

            {/* Section 6: Passenger Conduct */}
            <section id="passenger-conduct" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  06
                </div>
                <h2 className="text-lg font-black text-white">6. Passenger Safety & Code of Conduct</h2>
              </div>
              <p>
                To maintain safe, sanitary, and family-friendly transit for all passengers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 flex items-start space-x-2.5">
                  <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block">Strict Non-Smoking Policy</strong>
                    <span className="text-zinc-400">Smoking, vaping, or chewing tobacco is strictly prohibited inside vehicles.</span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 flex items-start space-x-2.5">
                  <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block">No Alcohol or Illegal Contraband</strong>
                    <span className="text-zinc-400">Consumption of alcohol or transportation of illegal contraband is strictly forbidden under Indian law.</span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-taxi-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block">Mandatory Seatbelts</strong>
                    <span className="text-zinc-400">Passengers must wear seatbelts at all times as prescribed under the Motor Vehicles Act.</span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 flex items-start space-x-2.5">
                  <UserCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block">Mutual Respect</strong>
                    <span className="text-zinc-400">Passengers and drivers must treat each other with courtesy, dignity, and respect.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Luggage & Capacity */}
            <section id="luggage-policy" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  07
                </div>
                <h2 className="text-lg font-black text-white">7. Luggage Capacity & Seating Limits</h2>
              </div>
              <p>
                Passengers must adhere to the certified seating and luggage capacities registered for each vehicle type:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-1">
                  <span className="font-bold text-white block">Sedans (Dzire, Etios):</span>
                  <span className="text-zinc-400 block">Up to 4 Passengers + 2 Large Suitcases + 2 Handbags.</span>
                </div>
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-1">
                  <span className="font-bold text-white block">SUVs (Innova Crysta, Ertiga):</span>
                  <span className="text-zinc-400 block">Up to 6-7 Passengers + 3-4 Large Suitcases + Handbags (carrier available upon request).</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                Overloading beyond legal registration capacity is not permitted by our drivers to ensure passenger insurance coverage remains valid.
              </p>
            </section>

            {/* Section 8: Driver Standards */}
            <section id="driver-standards" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  08
                </div>
                <h2 className="text-lg font-black text-white">8. Fleet & Driver Service Standards</h2>
              </div>
              <p>
                <strong className="text-white">{brandTitle}</strong> requires all fleet operators and drivers to uphold high hospitality standards:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                <li>Vehicles are thoroughly cleaned, sanitized, and air-conditioned before every trip.</li>
                <li>Drivers possess commercial driving licenses, verified background checks, and valid fitness/pollution certificates.</li>
                <li>Safe, defensive driving adhering strictly to national highway speed regulations.</li>
              </ul>
            </section>

            {/* Section 9: Lost & Found */}
            <section id="lost-found" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  09
                </div>
                <h2 className="text-lg font-black text-white">9. Lost & Found Property Protocol</h2>
              </div>
              <p>
                Drivers check the vehicle cabin at the end of each trip. If you realize you have left a phone, wallet, bag, or personal item in a cab:
              </p>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <p>
                  1. Immediately call our 24/7 Helpline (<a href={`tel:${cleanPhone}`} className="text-taxi-yellow font-bold hover:underline">{supportPhone}</a>) or WhatsApp dispatch with your booking reference.
                </p>
                <p>
                  2. Our dispatch desk will contact the driver immediately and coordinate the secure handover or delivery of your item.
                </p>
                <p className="text-zinc-500 italic">
                  Note: While we make every honest effort to recover lost items, passengers are urged to double-check their belongings before de-boarding.
                </p>
              </div>
            </section>

            {/* Section 10: Liability & Jurisdiction */}
            <section id="liability-jurisdiction" className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
                <div className="w-8 h-8 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-xs">
                  10
                </div>
                <h2 className="text-lg font-black text-white">10. Limitation of Liability & Legal Jurisdiction</h2>
              </div>
              <p>
                While we strive for 100% on-time arrivals, <strong className="text-white">{brandTitle}</strong> shall not be held financially liable for delays caused by force majeure events beyond reasonable control, including extreme fog, highway road blockages, major accidents on route, or unforeseen mechanical breakdowns (in which case an emergency backup vehicle is dispatched promptly).
              </p>
              <p>
                <strong>Governing Law:</strong> These terms are governed by the laws of India. Any disputes arising in connection with our services shall be subject exclusively to the jurisdiction of the civil courts in <strong>Jalandhar, Punjab, India</strong>.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleOpenBooking}
                  className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-black text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-taxi-yellow/20"
                >
                  Book Your Ride Now
                </button>
                <Link
                  to="/privacy-policy"
                  className="bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all border border-zinc-800 hover:border-zinc-700 text-center flex items-center justify-center space-x-2"
                >
                  <span>View Privacy Policy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

          </main>
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
