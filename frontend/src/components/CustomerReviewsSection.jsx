import React from 'react';
import { Star, ShieldCheck, Quote, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    name: "Gurpreet Singh",
    location: "Model Town, Jalandhar",
    route: "Jalandhar ➔ Delhi IGI Airport T3",
    rating: 5,
    tag: "Airport Family Transfer",
    text: "Booked PB08 TAXI's Innova Crysta for our international flight to Canada. The vehicle was spotlessly clean, chilled AC, and chauffeur Gurwinder arrived 15 minutes early. Smooth, comfortable journey without any hidden costs!"
  },
  {
    name: "Dr. Simran Kaur",
    location: "Jalandhar Cantt",
    route: "Jalandhar ➔ Chandigarh PGI",
    rating: 5,
    tag: "Medical & Intercity One-Way",
    text: "Needed urgent early morning travel to Chandigarh. The WhatsApp booking was instant and driver was extremely polite and careful on the highway. Paid only for one-way drop with zero return fee."
  },
  {
    name: "Amitabh Sharma",
    location: "Ludhiana Industrial Area",
    route: "Ludhiana ⇄ Jalandhar Corporate",
    rating: 5,
    tag: "Business Commute",
    text: "Regularly use PB08 TAXI for client visits and factory commutes across Doaba. Courteous chauffeurs, transparent pricing, and punctual doorstep service every single time."
  }
];

export default function CustomerReviewsSection({ onOpenBooking }) {
  return (
    <section id="reviews" className="py-24 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-taxi-yellow/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-taxi-yellow/15 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-taxi-yellow" />
            <span>Trusted By 15,000+ Happy Travelers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Real Reviews From <span className="text-taxi-yellow">Verified Passengers</span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            From midnight airport transfers to family vacation tours, see why passengers across Punjab rate PB08 TAXI as their most trusted travel partner.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="glass-card-luxury rounded-3xl p-7 flex flex-col justify-between relative group"
            >
              <div>
                {/* Header Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-taxi-yellow">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-taxi-yellow stroke-none" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-zinc-700/60 group-hover:text-taxi-yellow/40 transition-colors" />
                </div>

                {/* Ride Tag */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                    ✓ {rev.tag}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Passenger Info */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-white text-sm">
                    {rev.name}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {rev.location}
                  </div>
                </div>

                <span className="text-[10px] font-bold text-taxi-yellow bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                  {rev.route}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Google Reviews Trust Bar */}
        <div className="mt-14 max-w-2xl mx-auto bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-black text-lg">
              G
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center space-x-1.5 justify-center sm:justify-start">
                <span>4.9 / 5.0 Star Rating</span>
                <span className="text-xs text-zinc-400 font-normal">• 450+ Reviews</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Verified Customer Reviews on Google Search &amp; Maps
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenBooking && onOpenBooking('Reviews Section')}
            className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black text-xs font-black px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            Experience The Ride →
          </button>
        </div>

      </div>
    </section>
  );
}
