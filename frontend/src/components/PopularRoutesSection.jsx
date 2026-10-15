import React from 'react';
import { MapPin, ArrowLeftRight, Plane, Car, Clock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackRouteClick } from '../utils/analytics';

const POPULAR_ROUTES = [
  {
    title: "Jalandhar to Delhi & Delhi to Jalandhar.",
    shortRoute: "Jalandhar ⇄ Delhi / IGI Airport.",
    keywords: ["Delhi Highway.", "IGI Airport Cab.", "One Way Drop.", "NH44 Route."],
    distance: "~375 km • 6–7 Hours via NH44.",
    description:
      "Non-stop air-conditioned rides between Jalandhar and Delhi IGI Airport (Terminals 1, 2, and 3). Available for both one-way drops and return journeys with zero return fee.",
    badge: "Bestseller Airport Route.",
    vehicles: "Dzire, Ertiga, Innova Crysta.",
  },
  {
    title: "Jalandhar to Amritsar & Amritsar to Jalandhar.",
    shortRoute: "Jalandhar ⇄ Amritsar / ATQ Airport.",
    keywords: ["Harmandir Sahib.", "Wagah Border.", "ATQ Airport.", "GT Road."],
    distance: "~85 km • 1.5 Hours via GT Road.",
    description:
      "Comfortable intercity cab travel for family visits to the Golden Temple, Wagah Border parade, and Amritsar Sri Guru Ram Dass Jee International Airport.",
    badge: "Golden Temple & Airport.",
    vehicles: "Sedan, SUV, Tempo Traveller.",
  },
  {
    title: "Jalandhar to Chandigarh & Chandigarh to Jalandhar.",
    shortRoute: "Jalandhar ⇄ Chandigarh / IXC Airport.",
    keywords: ["Sector 17.", "Mohali Transit.", "PGI Hospital.", "IXC Airport."],
    distance: "~150 km • 2.5–3 Hours.",
    description:
      "Punctual executive cars and family cabs connecting Jalandhar with Mohali, Panchkula, PGI, and Shaheed Bhagat Singh International Airport.",
    badge: "Express Highway Cab.",
    vehicles: "Dzire, Amaze, Innova Crysta.",
  },
  {
    title: "Jalandhar to Ludhiana & Ludhiana to Jalandhar.",
    shortRoute: "Jalandhar ⇄ Ludhiana City.",
    keywords: ["Industrial Hub.", "Railway Junction.", "City Commute.", "Express NH44."],
    distance: "~62 km • 1 Hour via NH44.",
    description:
      "Direct doorstep pickup for shopping, corporate business meetings, railway junction connections, and daily travel at guaranteed fixed prices.",
    badge: "1-Hour Intercity Express.",
    vehicles: "Hatchback, Sedan, SUV.",
  },
  {
    title: "Jalandhar to Hoshiarpur & Hoshiarpur to Jalandhar.",
    shortRoute: "Jalandhar ⇄ Hoshiarpur.",
    keywords: ["Doaba Belt.", "Local Outstation.", "Daily Commute.", "Hospital Transit."],
    distance: "~45 km • 50 Mins.",
    description:
      "Reliable day and night cab rides between Doaba hubs. Great for medical appointments, university visits, and smooth transit across Punjab.",
    badge: "Doaba Local & One-Way.",
    vehicles: "Sedan, Ertiga, Innova.",
  },
  {
    title: "All-Punjab One Way Drops & North India Outstation.",
    shortRoute: "Punjab, Himachal & North India.",
    keywords: ["Shimla Manali.", "Jammu Katra.", "Fixed Pricing.", "Zero Return Fare."],
    distance: "Pay Only One-Way Fare • Zero Return Charge.",
    description:
      "Travel anywhere across North India and pay only for the distance you ride. Transparent fixed pricing, courteous chauffeurs, and instant WhatsApp booking confirmation.",
    badge: "No Return Fare.",
    vehicles: "All Fleet Categories Available.",
  },
];

const SEO_SEARCH_TAGS = [
  "Airport Transfers.",
  "One Way Cabs.",
  "Outstation Trips.",
  "Delhi IGI Terminal Drops.",
  "Amritsar Golden Temple.",
  "Chandigarh Highway.",
  "Ludhiana Express.",
  "Hoshiarpur Travel.",
  "Innova Crysta Rental.",
  "Swift Dzire Booking.",
  "Fixed Fare Cabs.",
  "Punjab Roadways Taxi."
];

export default function PopularRoutesSection({ onOpenBooking }) {
  return (
    <section id="routes" className="py-24 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(250,204,21,0.06),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-taxi-yellow/15 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Popular Intercity Travel Routes.</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Popular <span className="text-taxi-yellow">Outstation</span> &amp; <span className="text-taxi-yellow">Airport Cab</span> Routes.
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Choose reliable doorstep rides, one-way drops, and on-time airport transfers connecting Punjab, Delhi NCR, Chandigarh, and Himachal Pradesh.
          </p>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {POPULAR_ROUTES.map((route, idx) => (
            <article
              key={idx}
              className="group bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/90 hover:border-taxi-yellow/50 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-black bg-taxi-yellow px-3 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{route.shortRoute}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-300 bg-zinc-800/90 border border-zinc-700/70 px-2.5 py-1 rounded-full">
                    {route.badge}
                  </span>
                </div>

                {/* H3 Route Title with target keywords */}
                <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2.5 group-hover:text-taxi-yellow transition-colors leading-snug">
                  {route.title}
                </h3>

                {/* Distance & Duration */}
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-3">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{route.distance}</span>
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5">
                  {route.description}
                </p>

                {/* Route Keyword Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {route.keywords.map((kw, kIdx) => (
                    <span
                      key={kIdx}
                      className="text-[10px] font-semibold text-zinc-300 bg-zinc-950/90 border border-zinc-800 px-2 py-0.5 rounded-md"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Action inside Card */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-taxi-yellow flex-shrink-0" />
                  <span className="truncate">{route.vehicles}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const cleanRoute = route.shortRoute.replace(/\.$/, '');
                    trackRouteClick(cleanRoute);
                    onOpenBooking(cleanRoute);
                  }}
                  className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-4 py-2 rounded-xl text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Book Cab</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Banner linking to full Popular Routes Page */}
        <div className="mt-12 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-taxi-yellow bg-taxi-yellow/10 border border-taxi-yellow/20 px-3 py-1 rounded-full">
              Across Punjab &amp; All India.
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Looking for More Destinations &amp; Outstation Routes?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              We operate cabs across Delhi NCR, Himachal Pradesh (Manali, Shimla, Dharamshala), Katra / Vaishno Devi, Rajasthan, Haryana, and Uttarakhand with guaranteed one-way drops &amp; zero return fare.
            </p>
          </div>
          <Link
            to="/popular-routes"
            className="flex-shrink-0 bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
          >
            <span>View All 35+ India Routes &amp; Rates.</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Popular Search Keywords Cloud for SEO & Quick Booking */}
        <div className="mt-12 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-taxi-yellow mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Popular Jalandhar &amp; Outstation Taxi Searches.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SEO_SEARCH_TAGS.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const cleanTag = tag.replace(/\.$/, '');
                  trackRouteClick(`Search Pill: ${cleanTag}`);
                  onOpenBooking(cleanTag);
                }}
                className="text-xs font-semibold text-zinc-300 hover:text-black bg-zinc-950 hover:bg-taxi-yellow border border-zinc-800 hover:border-taxi-yellow px-3 py-1.5 rounded-lg transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
