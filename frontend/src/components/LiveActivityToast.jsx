import React, { useState, useEffect } from 'react';
import { Car, Plane, MapPin, CheckCircle2, X, Sparkles } from 'lucide-react';

const LIVE_ACTIVITIES = [
  {
    id: 1,
    icon: Car,
    type: "Ride Booked",
    text: "Swift Dzire booked: Model Town Jalandhar ➔ Delhi IGI Airport T3",
    timeAgo: "2 mins ago",
    tag: "Airport Drop"
  },
  {
    id: 2,
    icon: Plane,
    type: "Chauffeur Dispatched",
    text: "Innova Crysta dispatched to Amritsar Airport (ATQ)",
    timeAgo: "6 mins ago",
    tag: "Flight Transfer"
  },
  {
    id: 3,
    icon: MapPin,
    type: "One-Way Confirmed",
    text: "AC Sedan confirmed: Jalandhar Cantt ➔ Chandigarh Sector 17",
    timeAgo: "11 mins ago",
    tag: "Fixed Fare"
  },
  {
    id: 4,
    icon: CheckCircle2,
    type: "Safe Ride Completed",
    text: "Family round-trip completed: Jalandhar ➔ Golden Temple Amritsar",
    timeAgo: "18 mins ago",
    tag: "5★ Rated"
  },
  {
    id: 5,
    icon: Car,
    type: "Instant Booking",
    text: "Ertiga 6-Seater booked: Phagwara Highway ➔ Ludhiana Junction",
    timeAgo: "24 mins ago",
    tag: "Outstation"
  }
];

export default function LiveActivityToast({ onOpenBooking }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show toast after 2.5 seconds initially
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (isDismissed) return;

    // Rotate toast every 6.5 seconds with smooth fade
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
        setIsVisible(true);
      }, 400);
    }, 6500);

    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = LIVE_ACTIVITIES[currentIndex];
  const Icon = current.icon;

  return (
    <aside 
      aria-label="Live Taxi Activity Notification"
      className={`fixed bottom-20 sm:bottom-6 left-4 z-40 max-w-[340px] sm:max-w-[380px] transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative group bg-zinc-950/90 hover:bg-zinc-900/95 border border-zinc-800 hover:border-taxi-yellow/60 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 shadow-2xl shadow-black/80 flex items-start space-x-3 transition-colors duration-300">
        
        {/* Glowing Radar Icon */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-taxi-yellow/15 border border-taxi-yellow/30 text-taxi-yellow flex items-center justify-center">
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-black"></span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-taxi-yellow">
              {current.type}
            </span>
            <span className="text-[10px] text-zinc-500">•</span>
            <span className="text-[10px] text-zinc-400 font-medium">{current.timeAgo}</span>
          </div>

          <p 
            onClick={() => onOpenBooking && onOpenBooking(current.text)}
            className="text-xs font-semibold text-zinc-200 hover:text-taxi-yellow transition-colors leading-snug mt-0.5 line-clamp-2 cursor-pointer"
          >
            {current.text}
          </p>

          <div className="mt-1 flex items-center space-x-2">
            <span className="text-[9px] font-bold bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 px-1.5 py-0.5 rounded">
              {current.tag}
            </span>
            <button
              onClick={() => onOpenBooking && onOpenBooking(current.text)}
              className="text-[10px] font-bold text-taxi-yellow hover:underline flex items-center space-x-1"
            >
              <span>Book Ride →</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          aria-label="Dismiss Notification"
          className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </aside>
  );
}
