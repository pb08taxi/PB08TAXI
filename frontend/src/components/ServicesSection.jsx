import React from 'react';
import { Plane, Compass, Navigation, Clock, Building, ShieldCheck, ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    icon: Plane,
    title: "Airport Transfers",
    description: "Reliable, on-time pickups and drops for Amritsar (ATQ), Chandigarh (IXC), and Delhi (DEL) airports. Flight tracking included.",
    tag: "Most Popular",
  },
  {
    icon: Compass,
    title: "Outstation Journeys",
    description: "Comfortable one-way and round trips across Himachal, Jammu & Kashmir, Delhi NCR, Rajasthan, and Chandigarh with verified chauffeurs.",
    tag: "Best Rates",
  },
  {
    icon: Navigation,
    title: "Local City Taxi",
    description: "Point-to-point and hourly city rides throughout Jalandhar, Phagwara, Ludhiana, Kapurthala, and Hoshiarpur.",
    tag: "Quick Dispatch",
  },
  {
    icon: Clock,
    title: "24/7 Emergency Cabs",
    description: "Late night trains, early morning departures, or medical emergencies — our dispatch team operates round the clock.",
    tag: "Always Active",
  },
  {
    icon: Building,
    title: "Corporate & Event Travel",
    description: "Dedicated executive cars for business delegations, wedding convoys, VIP guests, and official corporate commutes.",
    tag: "Premium",
  },
  {
    icon: ShieldCheck,
    title: "Tour & Pilgrimage Packages",
    description: "Curated travel packages to Golden Temple Amritsar, Vaishno Devi, Dharamshala, Manali, and Shimla.",
    tag: "Family Special",
  },
];

export default function ServicesSection({ onOpenBooking }) {
  return (
    <section id="services" className="py-24 bg-[#0A0A0A] border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-taxi-yellow/10 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
            <span>What We Offer.</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Our Premium Taxi Services.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Whether it's a short city hop or a multi-day hill station tour, PB08 TAXI delivers clean cars, courteous drivers, and transparent pricing.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((srv, index) => {
            const Icon = srv.icon;
            return (
              <div
                key={index}
                className="group bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-taxi-yellow/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-taxi-yellow/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 group-hover:bg-taxi-yellow text-taxi-yellow group-hover:text-black flex items-center justify-center transition-colors duration-300 shadow-md">
                      <Icon className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-zinc-800/80 text-zinc-300 group-hover:text-taxi-yellow px-3 py-1 rounded-full border border-zinc-700/60">
                      {srv.tag}.
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-taxi-yellow transition-colors">
                    {srv.title}.
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    {srv.description}
                  </p>
                </div>

                <button
                  onClick={onOpenBooking}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-taxi-yellow hover:text-white transition-colors group-hover:translate-x-1 duration-200"
                >
                  <span>Book This Service.</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Why Travelers Prefer PB08 TAXI (Natural conversational English, Grade 8-9 readability) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-2">
            <span className="text-xs font-mono text-taxi-yellow uppercase font-bold tracking-wider">Zero Cancellations.</span>
            <h4 className="text-base font-bold text-white">Guaranteed Car &amp; Chauffeur.</h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Unlike ride-hailing apps with frequent driver cancellations, PB08 TAXI confirms your car and driver well in advance. Your ride is 100% assured.
            </p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-2">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">Express Highway Transit.</span>
            <h4 className="text-base font-bold text-white">Direct Non-Stop Navigation.</h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Our chauffeurs take the fastest national expressways (NH44 and NH703). You enjoy smooth highway cruising with zero unexpected detours.
            </p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-2">
            <span className="text-xs font-mono text-blue-400 uppercase font-bold tracking-wider">Warm Hospitality.</span>
            <h4 className="text-base font-bold text-white">Luggage &amp; Senior Citizen Help.</h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              We treat every traveler like family. Chauffeurs gladly help elderly passengers with boarding and carry heavy airport luggage right to your doorstep.
            </p>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-black text-white">Need a customized outstation package?</h3>
            <p className="text-sm text-zinc-400">
              Speak directly with our local Punjab travel coordinator for multi-city itineraries and group vans.
            </p>
          </div>
          <button
            onClick={onOpenBooking}
            className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0"
          >
            One Click Book Your Ride.
          </button>
        </div>

      </div>
    </section>
  );
}
