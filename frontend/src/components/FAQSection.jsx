import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall, Car, ShieldCheck } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const FAQS = [
  {
    q: "How can I book a cab with PB08 TAXI?",
    a: "Booking is effortless! Click the 'One Click Book Your Ride' button anywhere on our website, enter your pickup location, drop destination, date & time, and select your preferred vehicle. You'll receive instant booking confirmation directly on WhatsApp with driver and vehicle details. Alternatively, you can call our 24/7 dispatch helpline directly."
  },
  {
    q: "Do you offer airport taxi transfers for Delhi (DEL), Amritsar (ATQ), and Chandigarh (IXC)?",
    a: "Yes! We specialize in on-time airport transfers between Jalandhar, all Punjab towns, and Delhi IGI Airport (T1, T2, T3), Amritsar Sri Guru Ram Dass Jee International Airport, and Chandigarh Shaheed Bhagat Singh Airport. We track your flight status in real time to ensure zero wait times upon your landing."
  },
  {
    q: "Which vehicles are available in your taxi fleet?",
    a: "We maintain a pristine, fully air-conditioned fleet: Compact Sedans (Maruti Swift Dzire, Honda Amaze), Premium SUVs (Toyota Innova Crysta, Maruti Ertiga, Kia Carens), Luxury Executive Cars (Toyota Fortuner, BMW, Audi for VIPs & weddings), and 12 to 17-seater Tempo Travellers for group tours."
  },
  {
    q: "Are PB08 TAXI fares transparent with no hidden charges?",
    a: "Yes, 100%. We believe in fair, transparent pricing with no surge fees or surprise extras. Before your trip begins, our dispatch team provides complete clarity on vehicle charges, driver allowance, tolls, and state border permits so you know the exact cost in advance."
  },
  {
    q: "Can I book a one-way outstation cab or is it only round-trip?",
    a: "PB08 TAXI offers both one-way drop cabs and round-trip rentals. If you only need a drop from Jalandhar to Delhi, Chandigarh, Amritsar, Himachal (Shimla, Manali, Dharamshala), or Jammu, you only pay for the one-way route without having to pay for the return journey."
  },
  {
    q: "Are PB08 TAXI chauffeurs verified and safe for night travel?",
    a: "Safety is our paramount commitment. Every chauffeur undergoes thorough background screening, commercial licensing verification, and highway driving safety checks. Our drivers are courteous, strictly non-smoking, punctual, and well-trained for late-night family and solo passenger travel."
  }
];

export default function FAQSection({ onOpenBooking }) {
  const [openIndex, setOpenIndex] = useState(0); // Open first item by default
  const { settings } = useSiteSettings();
  const phone = settings?.support_phone || '+91 98765 43210';
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-24 bg-black border-t border-zinc-900 relative">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(250,204,21,0.06),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-taxi-yellow/15 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions? We Have Answers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Frequently Asked <span className="text-taxi-yellow">Questions</span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about booking PB08 TAXI, airport transfers, transparent pricing, and our 24/7 Punjab cab fleet.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-zinc-950 border-taxi-yellow/50 shadow-lg shadow-taxi-yellow/5'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between space-x-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-taxi-yellow"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base sm:text-lg text-white flex items-center space-x-3">
                    <span className="text-taxi-yellow font-black text-sm">0{index + 1}.</span>
                    <span>{faq.q}</span>
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-taxi-yellow text-black rotate-180'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-zinc-300 text-sm sm:text-base leading-relaxed border-t border-zinc-800/60">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Box */}
        <div className="mt-14 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start space-x-2">
              <ShieldCheck className="w-5 h-5 text-taxi-yellow inline" />
              <span>Have a specific travel question or special request?</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Our 24/7 Punjab taxi dispatch managers are always ready to assist you.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href={telLink}
              className="inline-flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-3 rounded-xl text-sm transition-all border border-zinc-700"
            >
              <PhoneCall className="w-4 h-4 text-taxi-yellow" />
              <span>Call Now</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="inline-flex items-center space-x-2 bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-5 py-3 rounded-xl text-sm shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Car className="w-4 h-4" />
              <span>Book Ride</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
