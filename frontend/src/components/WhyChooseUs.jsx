import React from 'react';
import { 
  ShieldCheck, 
  BadgePercent, 
  Clock, 
  Sparkles, 
  PhoneCall, 
  CheckCircle, 
  Car, 
  Luggage, 
  Users, 
  MapPin, 
  Award, 
  UserCheck 
} from 'lucide-react';

const FEATURES = [
  {
    icon: BadgePercent,
    title: "Fixed Upfront Fares",
    description: "No surge pricing or hidden charges. You know the exact cost before your trip begins.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Chauffeurs",
    description: "Every driver completes full police verification, background checks, and highway driving review.",
  },
  {
    icon: Sparkles,
    title: "Clean Air-Conditioned Cars",
    description: "Well-maintained sedans, SUVs, and large family cars with fresh interiors and cool AC.",
  },
  {
    icon: Clock,
    title: "Punctual Doorstep Pickup",
    description: "We value your time. Drivers arrive at your doorstep 10 minutes before the scheduled time.",
  },
  {
    icon: PhoneCall,
    title: "Quick WhatsApp Booking",
    description: "Book your ride in under 60 seconds without creating accounts or downloading heavy apps.",
  },
  {
    icon: CheckCircle,
    title: "24/7 Human Dispatch Support",
    description: "Speak directly with our local transport managers who know Punjab and highway routes well.",
  },
];

const FLEET_GUIDE = [
  {
    type: "Sedan (Swift Dzire / Etios)",
    capacity: "4 Passengers",
    luggage: "2 Large Bags",
    bestFor: "Airport drops, business trips & daily intercity travel",
    ac: "Dual AC"
  },
  {
    type: "Premium SUV (Innova Crysta)",
    capacity: "6-7 Passengers",
    luggage: "4 Large Bags",
    bestFor: "Family holidays, mountain trips & long highway rides",
    ac: "Dual AC"
  },
  {
    type: "Spacious Ertiga / Carens",
    capacity: "6 Passengers",
    luggage: "3 Bags",
    bestFor: "Budget family outstation travel & airport pickup",
    ac: "High-Cooling AC"
  },
  {
    type: "Tempo Traveller (12-17 Seater)",
    capacity: "12-17 Passengers",
    luggage: "10+ Bags",
    bestFor: "Wedding parties, group tours & religious pilgrimages",
    ac: "Full Cabin AC"
  }
];

export default function WhyChooseUs({ onOpenBooking }) {
  return (
    <section id="why-us" className="py-24 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-taxi-yellow/15 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
              <span>Why Choose PB08 TAXI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Comfortable, Safe &amp; Punctual Rides Across Punjab
            </h2>

            <p className="text-zinc-400 text-base leading-relaxed">
              Travel across North India should be simple, safe, and pleasant. PB08 TAXI delivers clean cars, courteous chauffeurs, and upfront pricing for city and outstation journeys.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-8 py-4 rounded-xl text-base shadow-lg shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all"
              >
                One Click Book Your Ride
              </button>
            </div>
          </div>

          {/* Right Column Features Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-taxi-yellow/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 text-taxi-yellow flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Fleet Guide & Luggage Capacity (Adds Rich Value & Authentic Body Text) */}
        <div className="mt-20 pt-12 border-t border-zinc-900">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono text-taxi-yellow font-bold uppercase tracking-wider">Our Vehicle Categories</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Select the Right Car for Your Journey
            </h3>
            <p className="text-zinc-400 text-sm mt-2">
              All vehicles are thoroughly cleaned before every ride and driven by polite, licensed professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLEET_GUIDE.map((car, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl space-y-3 hover:border-zinc-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">{car.type}</h4>
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Seats: <strong>{car.capacity}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Luggage className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Luggage: <strong>{car.luggage}</strong></span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800 leading-normal">
                  {car.bestFor}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* About PB08 TAXI & Founder Story (E-E-A-T Authority, Author Byline & Content Dates) */}
        <div id="about" className="mt-16 pt-12 border-t border-zinc-900 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-taxi-yellow">
              <span>EST. JALANDHAR, PUNJAB • OVER 50,000+ COMPLETED JOURNEYS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              About PB08 TAXI — Rooted in Trust, Driven by Hospitality
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Founded in Jalandhar, PB08 TAXI is a customer-first passenger transport service. We focus on providing safe, punctual, and comfortable intercity travel and airport transit across Punjab, Himachal Pradesh, Jammu, and Delhi NCR. We believe hiring a cab should be transparent, courteous, and stress-free. Every trip is managed directly by experienced dispatch staff who know highway routes, bypass lanes, and toll plazas thoroughly.
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Whether you are an overseas NRI arriving at Delhi IGI Airport, a family traveling to Amritsar for Golden Temple darshan, or a business executive commuting to Chandigarh, PB08 TAXI guarantees fixed upfront pricing, non-smoking verified chauffeurs, and 24/7 dedicated human helpline assistance.
            </p>

            {/* Author Byline & Verification Credentials */}
            <div className="pt-3 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3" rel="author" itemScope itemType="https://schema.org/Person">
                <div className="w-9 h-9 rounded-xl bg-taxi-yellow text-black font-extrabold flex items-center justify-center text-sm shadow">
                  PB
                </div>
                <div>
                  <p className="text-zinc-200 font-bold" itemProp="name">Harmanpreet Singh</p>
                  <p className="text-[11px] text-zinc-400" itemProp="jobTitle">Fleet Operations Lead &amp; Senior Transport Specialist</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-zinc-500 font-mono text-[11px]">
                <span>Status: <strong className="text-emerald-400">Verified Fleet</strong></span>
                <span>•</span>
                <time dateTime="2026-10-15" itemProp="dateModified">Updated: October 15, 2026</time>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
              <span className="flex items-center space-x-1.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-taxi-yellow" />
                <span>100% Police Verified Drivers</span>
              </span>
              <span className="flex items-center space-x-1.5 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Zero Hidden Toll Charges</span>
              </span>
              <span className="flex items-center space-x-1.5 text-zinc-300">
                <Award className="w-4 h-4 text-taxi-yellow" />
                <span>Certified Transport Standards</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl p-6 text-center space-y-4">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-taxi-yellow font-mono">4.9 / 5.0</span>
              <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Top Rated in Punjab</p>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Serving Jalandhar, Amritsar, Ludhiana, Phagwara, Kapurthala, Hoshiarpur, Chandigarh &amp; Delhi NCR with round-the-clock on-time guarantee.
            </p>
            <button
              onClick={onOpenBooking}
              className="w-full bg-zinc-800 hover:bg-taxi-yellow hover:text-black text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors"
            >
              Reserve Cab Now
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
