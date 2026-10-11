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

      </div>
    </section>
  );
}
