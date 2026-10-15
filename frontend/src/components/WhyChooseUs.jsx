import React from 'react';
import { ShieldCheck, BadgePercent, Clock, Sparkles, PhoneCall, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: BadgePercent,
    title: "Transparent & Fixed Pricing",
    description: "No surge pricing, hidden toll charges, or surprise extras. Know your exact fare before you start.",
  },
  {
    icon: ShieldCheck,
    title: "100% Verified Drivers",
    description: "Every chauffeur undergoes background verification, commercial license check, and professional hospitality training.",
  },
  {
    icon: Sparkles,
    title: "Sanitized & AC Cabs",
    description: "Immaculate sedans, SUVs, and hatchbacks equipped with high-efficiency air conditioning and clean interiors.",
  },
  {
    icon: Clock,
    title: "On-Time Arrival Guarantee",
    description: "We respect your flight times and appointment schedules. Our drivers arrive at your doorstep 10 minutes early.",
  },
  {
    icon: PhoneCall,
    title: "Instant WhatsApp Booking",
    description: "Simple one-click reservation without complicated account signups or intrusive app downloads.",
  },
  {
    icon: CheckCircle,
    title: "24/7 Human Dispatch Helpline",
    description: "Direct access to real fleet managers who know Punjab, Himachal, and highway routes intimately.",
  },
];

export default function WhyChooseUs({ onOpenBooking }) {
  return (
    <section id="why-us" className="py-24 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-taxi-yellow/15 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
              <span>Why Choose PB08 TAXI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              The Taxi Service Built Around Your Peace of Mind
            </h2>

            <p className="text-zinc-400 text-base leading-relaxed">
              In Punjab, travel should be seamless, reliable, and respectful. PB08 TAXI was created to eliminate the unpredictability of hailing cabs or dealing with unreliable drivers.
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

          {/* Right Column Grid */}
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

        {/* About PB08 TAXI & Founder Story (E-E-A-T Authority & Trust Section) */}
        <div id="about" className="mt-16 pt-12 border-t border-zinc-900 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-taxi-yellow">
              <span>EST. JALANDHAR, PUNJAB • OVER 50,000+ RIDES DELIVERED</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              About PB08 TAXI — Rooted in Trust, Driven by Hospitality
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Founded in Jalandhar, PB08 TAXI is a customer-first transportation network dedicated to offering safe, punctual, and transparent intercity and airport travel across Punjab, Himachal, Jammu, and Delhi NCR. We believe hiring a cab should be transparent, courteous, and stress-free. Every ride is managed directly by seasoned dispatch professionals who know every bypass, toll plaza, and highway checkpoint intimately.
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Whether you are an NRI arriving at Delhi IGI Airport, a family visiting the Golden Temple in Amritsar, or a business executive traveling between Jalandhar and Chandigarh, PB08 TAXI guarantees fixed upfront pricing, non-smoking verified chauffeurs, and 24/7 dedicated human helpline assistance.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-zinc-400 border-t border-zinc-900">
              <span className="flex items-center space-x-1.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-taxi-yellow" />
                <span>100% Police Verified Fleet</span>
              </span>
              <span className="flex items-center space-x-1.5 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Zero Hidden Toll / Surge Fees</span>
              </span>
              <span className="text-zinc-500 font-mono">
                Updated: October 2026 • Published by PB08 Taxi Operations Team
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
