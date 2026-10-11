import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  User, 
  Phone,
  Calendar,
  Clock,
  ChevronDown,
  Search
} from 'lucide-react';
import { createBooking, getPublicFleetCars } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const POPULAR_COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN +91' },
  { code: '+1', flag: '🇨🇦', label: 'CA +1' },
  { code: '+1', flag: '🇺🇸', label: 'US +1' },
  { code: '+44', flag: '🇬🇧', label: 'UK +44' },
  { code: '+971', flag: '🇦🇪', label: 'AE +971' },
  { code: '+61', flag: '🇦🇺', label: 'AU +61' },
  { code: '+64', flag: '🇳🇿', label: 'NZ +64' },
  { code: '+49', flag: '🇩🇪', label: 'DE +49' },
  { code: '+39', flag: '🇮🇹', label: 'IT +39' },
  { code: '+65', flag: '🇸🇬', label: 'SG +65' },
  { code: '+60', flag: '🇲🇾', label: 'MY +60' },
  { code: '+974', flag: '🇶🇦', label: 'QA +974' },
  { code: '+966', flag: '🇸🇦', label: 'SA +966' },
  { code: '+965', flag: '🇰🇼', label: 'KW +965' },
  { code: 'OTHER', flag: '🌐', label: 'Other (+...)' },
];

export const DEFAULT_PRESET_CARS = [
  { id: 'c1', name: 'Swift Dzire', category: 'Sedan', seating_capacity: '4+1 Seater' },
  { id: 'c2', name: 'Toyota Innova Crysta', category: 'SUV', seating_capacity: '6+1 Seater' },
  { id: 'c3', name: 'Maruti Ertiga', category: 'SUV', seating_capacity: '6+1 Seater' },
  { id: 'c4', name: 'Hyundai Aura', category: 'Sedan', seating_capacity: '4+1 Seater' },
  { id: 'c5', name: 'Honda City', category: 'Sedan', seating_capacity: '4+1 Seater' },
  { id: 'c6', name: 'Mahindra Scorpio', category: 'SUV', seating_capacity: '7+1 Seater' },
  { id: 'c7', name: 'Toyota Fortuner', category: 'Luxury', seating_capacity: '6+1 Seater' },
  { id: 'c8', name: 'Tempo Traveller', category: 'Tempo Traveller', seating_capacity: '12+1 Seater' },
];

export default function BookingModal({ isOpen, onClose }) {
  const { showSuccess, showError } = useToast();
  const { settings } = useSiteSettings();
  const modalAnimation = settings?.booking_modal_animation || 'golden-glow';
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const [formData, setFormData] = useState({
    customer_name: '',
    pickup_location: '',
    destination: '',
    car_name: '',
    pickup_date: getTodayDateString(),
    pickup_time: getCurrentTimeString(),
    marketing_consent: true,
  });

  // Fleet Cars selection & search state
  const [fleetCars, setFleetCars] = useState(DEFAULT_PRESET_CARS);
  const [loadingFleetCars, setLoadingFleetCars] = useState(false);
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [isCarPickerOpen, setIsCarPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      const fetchFleetCars = async () => {
        try {
          setLoadingFleetCars(true);
          const data = await getPublicFleetCars();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setFleetCars(data);
          } else if (isMounted) {
            setFleetCars(DEFAULT_PRESET_CARS);
          }
        } catch (e) {
          console.warn("Could not load fleet cars for booking modal, using presets:", e);
          if (isMounted) setFleetCars(DEFAULT_PRESET_CARS);
        } finally {
          if (isMounted) setLoadingFleetCars(false);
        }
      };
      fetchFleetCars();
      return () => { isMounted = false; };
    }
  }, [isOpen]);

  const [countryCode, setCountryCode] = useState('+91');
  const [customCountryCode, setCustomCountryCode] = useState('');
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [whatsappDigits, setWhatsappDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeCode = isCustomCountry
    ? (customCountryCode.startsWith('+') ? customCountryCode : `+${customCountryCode}`)
    : countryCode;
  const isIndia = activeCode === '+91';
  const cleanDigits = whatsappDigits.replace(/\D/g, '');
  const isPhoneValid = isIndia ? cleanDigits.length === 10 : (cleanDigits.length >= 7 && cleanDigits.length <= 15);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!cleanDigits) {
      setError('Please enter your WhatsApp mobile number.');
      return;
    }

    if (isIndia && cleanDigits.length !== 10) {
      setError('Please enter your complete 10-digit mobile number for India (+91).');
      return;
    }

    if (!isIndia && (cleanDigits.length < 7 || cleanDigits.length > 15)) {
      setError('Please enter a valid mobile number (7-15 digits).');
      return;
    }

    if (isCustomCountry && (!customCountryCode || customCountryCode === '+')) {
      setError('Please enter a valid country dial code (e.g. +44, +1, +971).');
      return;
    }

    if (!formData.pickup_date) {
      setError('Please select a pickup date.');
      return;
    }

    if (!formData.pickup_time) {
      setError('Please select a pickup time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        car_name: formData.car_name ? formData.car_name.trim() : undefined,
        whatsapp_number: `${activeCode}${cleanDigits}`,
      };
      const res = await createBooking(payload);
      setSuccessResult(res);
      showSuccess(
        `Ride booking received successfully! Booking Ref: ${res.booking_reference}`,
        'Booking Confirmed'
      );
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit booking. Please try again.';
      const formattedErr = typeof msg === 'string' ? msg : JSON.stringify(msg);
      setError(formattedErr);
      showError(formattedErr, 'Booking Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (successResult?.booking_reference) {
      navigator.clipboard.writeText(successResult.booking_reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setCountryCode('+91');
    setIsCustomCountry(false);
    setCustomCountryCode('');
    setWhatsappDigits('');
    setFormData({
      customer_name: '',
      pickup_location: '',
      destination: '',
      car_name: '',
      pickup_date: getTodayDateString(),
      pickup_time: getCurrentTimeString(),
      marketing_consent: true,
    });
    setCarSearchQuery('');
    setIsCarPickerOpen(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={handleReset}
      />

      {/* Outer Wrapper for Dialog + Ambient Animation Presets */}
      <div className="relative max-w-lg w-full z-10 my-auto">
        {/* Outer Background Animation Layer (Applied exclusively outside; inner form stays 100% stable) */}
        {modalAnimation === 'golden-glow' && (
          <>
            <div className="absolute -inset-3 sm:-inset-5 bg-gradient-to-r from-taxi-yellow/45 via-amber-400/40 to-yellow-500/45 rounded-[36px] animate-outer-golden-glow pointer-events-none -z-10" />
            <div className="absolute -inset-1 bg-taxi-yellow/20 rounded-3xl blur-md pointer-events-none -z-10" />
          </>
        )}

        {modalAnimation === 'cyber-neon' && (
          <>
            <div className="absolute -inset-1 sm:-inset-1.5 rounded-[28px] p-[2px] overflow-hidden pointer-events-none -z-10">
              <div className="absolute -inset-[150%] animate-cyber-neon-spin bg-[conic-gradient(from_0deg,#FACC15,#EAB308,#CA8A04,#121212,#FACC15)]" />
            </div>
            <div className="absolute -inset-4 bg-taxi-yellow/25 rounded-[34px] blur-xl animate-pulse pointer-events-none -z-10" />
          </>
        )}

        {modalAnimation === 'ambient-breath' && (
          <>
            <div className="absolute -inset-6 sm:-inset-10 bg-gradient-to-br from-taxi-yellow/35 via-amber-600/20 to-yellow-500/30 rounded-[44px] animate-ambient-deep-breath pointer-events-none -z-10" />
          </>
        )}

        {modalAnimation === 'radar-ripple' && (
          <>
            <div className="absolute -inset-2 sm:-inset-3 rounded-3xl border-2 border-taxi-yellow/50 animate-radar-ripple-1 pointer-events-none -z-10" />
            <div className="absolute -inset-2 sm:-inset-3 rounded-3xl border border-amber-400/40 animate-radar-ripple-2 pointer-events-none -z-10" />
            <div className="absolute -inset-4 bg-taxi-yellow/15 rounded-3xl blur-xl pointer-events-none -z-10" />
          </>
        )}

        {modalAnimation === 'aurora-shimmer' && (
          <>
            <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-yellow-400/50 via-amber-500/40 via-yellow-200/40 to-amber-600/50 rounded-[38px] blur-2xl animate-aurora-shimmer pointer-events-none -z-10" />
          </>
        )}

        {/* Modal Dialog Card (100% Solid & Stable — No scaling, jitter, or pulse!) */}
        <div className="relative bg-[#121212] border border-zinc-800 rounded-3xl w-full p-6 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        
        {/* Top Checker Pattern Accent */}
        <div className="absolute top-0 left-8 right-8 h-1.5 taxi-checker rounded-t-full" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!successResult ? (
          <div>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-taxi-yellow flex items-center justify-center text-black shadow-md shadow-taxi-yellow/20">
                <Car className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">One Click Book Your Ride</h2>
                <p className="text-xs text-zinc-400 font-medium">
                  Instant cab reservation with live WhatsApp confirmation
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Customer Name <span className="text-taxi-yellow">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* WhatsApp Number with customizable country code (default +91) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>
                    WhatsApp Number <span className="text-taxi-yellow">*</span>
                  </span>
                  <span className={`text-[11px] font-mono ${isPhoneValid ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {isIndia ? `${cleanDigits.length}/10 digits` : `${cleanDigits.length} digits`}
                  </span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-zinc-800 focus-within:border-taxi-yellow focus-within:ring-1 focus-within:ring-taxi-yellow transition-all bg-zinc-900">
                  {/* Selectable / Changeable Country Code Badge */}
                  {!isCustomCountry ? (
                    <div className="relative bg-zinc-800/90 hover:bg-zinc-750 border-r border-zinc-700/80 flex items-center transition-colors flex-shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => {
                          if (e.target.value === 'OTHER') {
                            setIsCustomCountry(true);
                            setCustomCountryCode('+');
                          } else {
                            setIsCustomCountry(false);
                            setCountryCode(e.target.value);
                          }
                          setError('');
                        }}
                        className="bg-transparent text-xs sm:text-sm font-bold text-taxi-yellow pl-3 pr-7 py-3 font-mono cursor-pointer outline-none appearance-none select-none"
                        title="Click to change country code"
                      >
                        {POPULAR_COUNTRY_CODES.map((c) => (
                          <option key={c.label} value={c.code} className="bg-zinc-900 text-white font-sans py-1">
                            {c.flag} {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-taxi-yellow absolute right-2 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex items-center bg-zinc-800/90 border-r border-zinc-700/80 px-2 py-2 flex-shrink-0">
                      <input
                        type="text"
                        value={customCountryCode}
                        onChange={(e) => {
                          let val = e.target.value.trim();
                          if (!val.startsWith('+')) val = '+' + val.replace(/\+/g, '');
                          const cleanCode = '+' + val.slice(1).replace(/\D/g, '').slice(0, 5);
                          setCustomCountryCode(cleanCode);
                          setError('');
                        }}
                        placeholder="+code"
                        className="w-16 bg-zinc-900 text-taxi-yellow text-xs sm:text-sm font-mono font-black py-1 px-1.5 rounded border border-zinc-700 outline-none text-center focus:border-taxi-yellow"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCountry(false);
                          setCountryCode('+91');
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white ml-1.5 p-1 rounded hover:bg-zinc-800"
                        title="Reset to default (+91)"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Phone input */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={isIndia ? 10 : 15}
                    required
                    value={whatsappDigits}
                    onChange={(e) => {
                      let raw = e.target.value;
                      if (raw.startsWith('+91')) {
                        setCountryCode('+91');
                        setIsCustomCountry(false);
                        raw = raw.slice(3);
                      } else if (raw.startsWith('+1')) {
                        setCountryCode('+1');
                        setIsCustomCountry(false);
                        raw = raw.slice(2);
                      } else if (raw.startsWith('+44')) {
                        setCountryCode('+44');
                        setIsCustomCountry(false);
                        raw = raw.slice(3);
                      }
                      const maxLen = isIndia ? 10 : 15;
                      const digits = raw.replace(/\D/g, '').slice(0, maxLen);
                      setWhatsappDigits(digits);
                      setError('');
                    }}
                    placeholder={isIndia ? '98765 43210' : 'Mobile number'}
                    className="w-full bg-transparent py-3 px-3.5 text-sm text-white placeholder-zinc-500 font-mono tracking-wider outline-none"
                  />

                  {isPhoneValid && (
                    <div className="pr-3 flex items-center text-emerald-400 flex-shrink-0" title="Valid phone number">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {isPhoneValid ? (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center space-x-1">
                    <span>✓</span>
                    <span>Dispatches to: <strong>{activeCode} {cleanDigits}</strong> with live confirmation.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
                    <span>
                      Default is <strong>+91</strong> (India). Click the code above to change for Canada, UK, US, or other countries.
                    </span>
                  </p>
                )}
              </div>

              {/* Pickup Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup Date (Use Calendar) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Pickup Date (Calendar) <span className="text-taxi-yellow">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-taxi-yellow absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="date"
                      name="pickup_date"
                      required
                      min={getTodayDateString()}
                      value={formData.pickup_date}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">Pick date via calendar</p>
                </div>

                {/* Pickup Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Pickup Time <span className="text-taxi-yellow">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-taxi-yellow absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="time"
                      name="pickup_time"
                      required
                      value={formData.pickup_time}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">Pick scheduled time</p>
                </div>
              </div>

              {/* Pickup Location (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Pickup Location <span className="text-zinc-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    placeholder="e.g. Model Town, Jalandhar / Home"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Destination (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Destination <span className="text-zinc-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Amritsar Airport, Chandigarh, Delhi NCR"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Select Car (Preferred Vehicle Model - Searchable by Car Name) */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>
                    Select Car <span className="text-zinc-500 text-[10px] font-normal lowercase">(optional preferred vehicle)</span>
                  </span>
                  {formData.car_name && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, car_name: '' }));
                        setCarSearchQuery('');
                      }}
                      className="text-[11px] text-taxi-yellow hover:underline flex items-center space-x-1"
                    >
                      <span>Clear selection</span>
                    </button>
                  )}
                </label>

                {/* Car Selector Trigger */}
                <div
                  onClick={() => setIsCarPickerOpen(!isCarPickerOpen)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus-within:border-taxi-yellow rounded-xl py-3 px-3.5 text-sm text-white flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Car className="w-4 h-4 text-taxi-yellow flex-shrink-0" />
                    {formData.car_name ? (
                      <span className="font-bold text-white truncate">{formData.car_name}</span>
                    ) : (
                      <span className="text-zinc-500">Any Available Cab (Or search & pick preferred car)</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCarPickerOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Dropdown with Live Search by Car Name */}
                {isCarPickerOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2.5 max-h-60 overflow-hidden flex flex-col animate-scale-up">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={carSearchQuery}
                        onChange={(e) => setCarSearchQuery(e.target.value)}
                        placeholder="Search car by name (e.g. Dzire, Innova, Ertiga)..."
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-taxi-yellow"
                      />
                    </div>

                    <div className="overflow-y-auto space-y-1 flex-1 pr-1 max-h-44">
                      {/* Default "Any Available" option */}
                      <div
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, car_name: '' }));
                          setIsCarPickerOpen(false);
                          setCarSearchQuery('');
                        }}
                        className={`p-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                          !formData.car_name
                            ? 'bg-taxi-yellow/15 text-taxi-yellow font-bold border border-taxi-yellow/30'
                            : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Car className="w-3.5 h-3.5 text-taxi-yellow" />
                          <span>Any Available Cab (Best Match)</span>
                        </div>
                        {!formData.car_name && <Check className="w-3.5 h-3.5 text-taxi-yellow" />}
                      </div>

                      {/* Filtered Fleet Cars */}
                      {fleetCars
                        .filter((c) =>
                          !carSearchQuery ||
                          c.name.toLowerCase().includes(carSearchQuery.toLowerCase()) ||
                          (c.category && c.category.toLowerCase().includes(carSearchQuery.toLowerCase()))
                        )
                        .map((car) => {
                          const isSelected = formData.car_name === car.name;
                          return (
                            <div
                              key={car.id}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, car_name: car.name }));
                                setIsCarPickerOpen(false);
                                setCarSearchQuery('');
                              }}
                              className={`p-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                                isSelected
                                  ? 'bg-taxi-yellow/15 text-taxi-yellow font-bold border border-taxi-yellow/30'
                                  : 'hover:bg-zinc-800 text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <Car className={`w-3.5 h-3.5 ${isSelected ? 'text-taxi-yellow' : 'text-zinc-500'}`} />
                                <span className="truncate">{car.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-zinc-500 flex-shrink-0">
                                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{car.category || 'Sedan'}</span>
                                {car.seating_capacity && (
                                  <span className="hidden sm:inline">{car.seating_capacity}</span>
                                )}
                                {isSelected && <Check className="w-3.5 h-3.5 text-taxi-yellow" />}
                              </div>
                            </div>
                          );
                        })}

                      {fleetCars.filter((c) =>
                        !carSearchQuery ||
                        c.name.toLowerCase().includes(carSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="py-4 text-center text-xs text-zinc-500">
                          No car found matching "{carSearchQuery}".
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Marketing Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketing_consent"
                    checked={formData.marketing_consent}
                    onChange={handleChange}
                    className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow w-4 h-4 accent-taxi-yellow cursor-pointer"
                  />
                  <span className="text-xs text-zinc-400 select-none leading-tight">
                    Receive trip updates, discount vouchers, and festival offers on WhatsApp.
                  </span>
                </label>
              </div>

              {/* Book Now Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-taxi-yellow hover:bg-taxi-yellowHover disabled:opacity-60 text-black font-black text-base py-4 rounded-xl shadow-lg shadow-taxi-yellow/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Confirming Your Ride...</span>
                    </>
                  ) : (
                    <span>Book Now</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-[11px] text-zinc-500">
                  By clicking Book Now, you agree to connect with PB08 TAXI dispatch team.
                </p>
              </div>

            </form>
          </div>
        ) : (
          /* Booking Confirmation Success State */
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-taxi-yellow/20 border border-taxi-yellow/40 rounded-full flex items-center justify-center mx-auto text-taxi-yellow">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white">Ride Booked Successfully!</h3>
              <p className="text-sm text-zinc-300">
                Hi <span className="font-bold text-taxi-yellow">{successResult.customer_name}</span>, your taxi request has been received.
              </p>
            </div>

            {/* Reference Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>BOOKING REFERENCE</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>ACTIVE</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black tracking-wider text-taxi-yellow font-mono">
                  {successResult.booking_reference}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-zinc-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                {(successResult.pickup_date || successResult.pickup_time) && (
                  <p>
                    <span className="text-zinc-500 font-medium">Pickup Schedule:</span>{' '}
                    <span className="text-taxi-yellow font-bold">
                      {successResult.pickup_date || 'Today'} {successResult.pickup_time ? `at ${successResult.pickup_time}` : ''}
                    </span>
                  </p>
                )}
                {successResult.car_name && (
                  <p>
                    <span className="text-zinc-500 font-medium">Selected Car:</span>{' '}
                    <span className="text-taxi-yellow font-bold">{successResult.car_name}</span>
                  </p>
                )}
                {successResult.pickup_location && (
                  <p><span className="text-zinc-500 font-medium">Pickup Location:</span> {successResult.pickup_location}</p>
                )}
                {successResult.destination && (
                  <p><span className="text-zinc-500 font-medium">Destination Drop:</span> {successResult.destination}</p>
                )}
                <p><span className="text-zinc-500 font-medium">WhatsApp:</span> <span className="font-mono text-zinc-300">{successResult.whatsapp_number}</span></p>
              </div>
            </div>

            {/* Exact WhatsApp Message confirmation indicator */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 flex items-start space-x-2 text-left">
              <MessageSquare className="w-4 h-4 text-taxi-yellow mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-white mb-0.5">WhatsApp Confirmation Dispatched</p>
                <p className="italic text-zinc-400">
                  "Hi {successResult.customer_name}, our support team will contact you shortly. You will receive a call from us soon. Thank you for connecting with PB08 TAXI!"
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold py-3.5 rounded-xl text-sm shadow-md hover:scale-[1.01] transition-transform"
            >
              Done / Book Another Ride
            </button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
