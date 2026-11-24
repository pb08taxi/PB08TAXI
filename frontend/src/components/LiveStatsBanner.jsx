import React from 'react';
import { ShieldCheck, Award, Clock, Star, Users, Zap, CheckCircle2 } from 'lucide-react';

const STATS = [
  {
    value: "15,400+",
    label: "Safe Trips Completed",
    subtext: "Across Punjab & North India",
    icon: Award,
  },
  {
    value: "99.8%",
    label: "On-Time Dispatch",
    subtext: "Punctual Doorstep & Airport Drops",
    icon: Clock,
  },
  {
    value: "50+ Fleet",
    label: "Sedans, SUVs & Crystas",
    subtext: "Chilled AC & Sanitized Interiors",
    icon: Zap,
  },
  {
    value: "4.9 / 5.0",
    label: "Customer Rating",
    subtext: "Based on 450+ Verified Reviews",
    icon: Star,
  },
];

export default function LiveStatsBanner({ onOpenBooking }) {
  return (
    <section 
      aria-label="PB08 TAXI Live Dispatch Statistics"
      className="relative z-20 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
    >
      <div className="bg-zinc-900/90 border border-zinc-800/90 hover:border-taxi-yellow/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70 transition-all duration-300">
        
        {/* Live Active Dispatch Pulse Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-zinc-800/80 gap-3">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-zinc-200">
              <strong className="text-emerald-400 font-extrabold">Live Dispatch Active:</strong> 18 Taxis operating right now in Jalandhar, GT Road &amp; Airport belts
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-400">
            <span className="inline-flex items-center text-taxi-yellow space-x-1">
              <Star className="w-3.5 h-3.5 fill-taxi-yellow" />
              <Star className="w-3.5 h-3.5 fill-taxi-yellow" />
              <Star className="w-3.5 h-3.5 fill-taxi-yellow" />
              <Star className="w-3.5 h-3.5 fill-taxi-yellow" />
              <Star className="w-3.5 h-3.5 fill-taxi-yellow" />
            </span>
            <span>Google Verified Chauffeurs</span>
          </div>
        </div>

        {/* 4 Stats Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="group p-3 rounded-2xl hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight group-hover:text-taxi-yellow transition-colors">
                    {stat.value}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-200 leading-snug">
                  {stat.label}
                </div>
                <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Guarantee Strip */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-zinc-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-taxi-yellow" />
            <span>Zero Advance Required for Local Rides</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Police Background-Verified Drivers</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-taxi-yellow" />
            <span>24/7 Human Dispatch Support</span>
          </div>
          <button
            onClick={() => onOpenBooking && onOpenBooking('Live Stats Banner')}
            className="text-taxi-yellow hover:underline font-bold text-xs"
          >
            Check Available Cars Now →
          </button>
        </div>

      </div>
    </section>
  );
}
