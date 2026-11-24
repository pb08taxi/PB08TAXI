import React, { useState } from 'react';
import { Car, Users, Luggage, Wind, ShieldCheck, Check, ArrowRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const DEFAULT_FLEET = [
  {
    id: 'sedan',
    name: 'Sedan Class',
    models: 'Maruti Dzire / Toyota Etios / Honda Amaze',
    tag: 'Most Popular for Daily & Airport',
    capacity: '4 Passengers',
    luggage: '2 Large + 2 Small Bags',
    ac: 'Chilled Dual AC',
    features: ['High Fuel Economy', 'Smooth Highway Ride', 'FastTag Enabled', 'Bottled Water & Clean Tissues'],
    idealFor: 'Solo travelers, couples, city transit, and fast airport drops.',
    defaultImage: '/cars/sedan-dzire.webp',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Suzuki_Dzire_II_1.2_GLX_Hybrid_Arctic_White_Pearl.jpg',
    settingKey: 'fleet_sedan_image'
  },
  {
    id: 'innova',
    name: 'Luxury SUV (Innova Crysta)',
    models: 'Toyota Innova Crysta / Hycross',
    tag: 'Executive & NRI Favorite',
    capacity: '6 to 7 Passengers',
    luggage: '4 Large Bags + 2 Small',
    ac: 'Dual AC with Individual Vents',
    features: ['Plush Captain Recliners', 'Superior Highway Suspension', 'Extra Legroom & Recline', 'Mobile Fast Charging'],
    idealFor: 'Family airport transit (Delhi/Amritsar), mountain roads (Shimla/Manali), and VIP travels.',
    defaultImage: '/cars/innova-crysta.webp',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Toyota_Innova_Crysta_2.4_Z_front_right.jpg',
    settingKey: 'fleet_innova_image'
  },
  {
    id: 'ertiga',
    name: 'Family MUV (Ertiga / Carens)',
    models: 'Maruti Ertiga / Kia Carens',
    tag: 'Best Value for Families',
    capacity: '6 Passengers',
    luggage: '3 Large Bags',
    ac: 'Roof-Mounted AC',
    features: ['Flexible 3-Row Seating', 'Economical Group Fare', 'Spacious Cabin', 'Smooth City Drive'],
    idealFor: 'Budget family outstation trips, shopping tours, and wedding transfers.',
    defaultImage: '/cars/ertiga-muv.webp',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Maruti_Suzuki_Ertiga%281%29.jpg',
    settingKey: 'fleet_ertiga_image'
  },
  {
    id: 'traveller',
    name: 'Tempo Traveller (12-17 Seater)',
    models: 'Force Traveller / Urbania',
    tag: 'Group Tours & Weddings',
    capacity: '12 to 17 Passengers',
    luggage: '10+ Bags Dedicated Space',
    ac: 'Full Cabin Powerful Cooling',
    features: ['Push-back Pushpit Seats', 'High Ceiling & Wide Aisle', 'Stereo Music System', 'Ample Boot Space'],
    idealFor: 'Pilgrimage to Golden Temple & Vaishno Devi, wedding barat convoys, and corporate tours.',
    defaultImage: '/cars/tempo-traveller.webp',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Force_Traveller_Luxury.jpg',
    settingKey: 'fleet_traveller_image'
  }
];

export default function FleetShowcaseSection({ onOpenBooking }) {
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('sedan');
  const [imgError, setImgError] = useState({});

  const selectedVehicle = DEFAULT_FLEET.find(v => v.id === activeTab) || DEFAULT_FLEET[0];

  // Resolve image from Admin settings override -> local webp -> fallback Wikimedia CDN
  const configuredImg = settings?.[selectedVehicle.settingKey];
  const activeImgSrc = imgError[selectedVehicle.id]
    ? selectedVehicle.fallbackUrl
    : (configuredImg && configuredImg.trim() ? configuredImg.trim() : selectedVehicle.defaultImage);

  return (
    <section id="fleet" className="py-24 bg-[#0A0A0A] border-t border-zinc-900 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-taxi-yellow/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-taxi-yellow/15 border border-taxi-yellow/30 px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PB08 Premium Fleet Lineup</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Choose Your <span className="text-taxi-yellow">Ride Category</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            All PB08 TAXI vehicles are 100% air-conditioned, commercially insured, GPS-tracked, and sanitized before every pickup.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {DEFAULT_FLEET.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveTab(v.id)}
              className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center space-x-2.5 ${
                activeTab === v.id
                  ? 'bg-taxi-yellow text-black shadow-lg shadow-taxi-yellow/30 scale-105 ring-2 ring-yellow-300'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>{v.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Vehicle Showcase Container */}
        <div className="glass-card-luxury rounded-3xl p-6 sm:p-10 border border-zinc-800 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Vehicle Image Display (Left / Top) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 group">
                
                {/* Background ambient lighting behind vehicle */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.18),transparent_70%)] pointer-events-none" />

                {/* Car Photo */}
                <img
                  src={activeImgSrc}
                  alt={selectedVehicle.name}
                  loading="eager"
                  decoding="async"
                  onError={() => {
                    setImgError(prev => ({ ...prev, [selectedVehicle.id]: true }));
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-100 contrast-105 drop-shadow-2xl"
                />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[11px] font-extrabold text-taxi-yellow flex items-center space-x-1.5 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sanitized &amp; Verified</span>
                </div>

                {/* Model Name Caption Pill */}
                <div className="absolute bottom-3 inset-x-3 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white truncate">{selectedVehicle.models}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">{selectedVehicle.tag.split(' ')[0]}</span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 mt-2 text-center flex items-center justify-center space-x-1">
                <span>* Actual vehicle model or equivalent premium commercial fleet provided.</span>
              </div>
            </div>

            {/* Vehicle Details & Specifications (Right) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-taxi-yellow text-black px-3.5 py-1 rounded-full shadow-sm">
                  {selectedVehicle.tag}
                </span>
                <span className="text-xs font-semibold text-zinc-400">
                  {selectedVehicle.models}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {selectedVehicle.name}
              </h3>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {selectedVehicle.idealFor}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="bg-zinc-900/90 border border-zinc-800 p-3 sm:p-3.5 rounded-2xl">
                  <div className="flex items-center space-x-2 text-taxi-yellow mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase text-zinc-400">Seating</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">
                    {selectedVehicle.capacity}
                  </div>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-3 sm:p-3.5 rounded-2xl">
                  <div className="flex items-center space-x-2 text-taxi-yellow mb-1">
                    <Luggage className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase text-zinc-400">Boot Space</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {selectedVehicle.luggage}
                  </div>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-3 sm:p-3.5 rounded-2xl">
                  <div className="flex items-center space-x-2 text-taxi-yellow mb-1">
                    <Wind className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase text-zinc-400">Climate</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">
                    {selectedVehicle.ac}
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {selectedVehicle.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button & Fixed Fare Guarantee */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => onOpenBooking && onOpenBooking(`Selected Vehicle: ${selectedVehicle.name}`)}
                  className="animate-luxury-streak bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-taxi-yellow/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 flex-shrink-0"
                >
                  <span>Book {selectedVehicle.name}</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="text-xs text-zinc-400 leading-snug">
                  <strong className="text-white block font-bold">100% Upfront Fixed Pricing</strong>
                  <span>Zero hidden return fees on one-way drops • Instant WhatsApp confirmation</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
