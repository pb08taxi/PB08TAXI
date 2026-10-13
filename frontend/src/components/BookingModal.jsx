import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { createBooking, getPublicFleetCars } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackBookingSubmitted } from '../utils/analytics';
import { formatISTDate, formatISTTime, formatDateSlash } from '../utils/dateTime';

export const POPULAR_COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: '+91', fullLabel: 'India (+91)' },
  { code: '+1', flag: '🇨🇦', label: '+1', fullLabel: 'Canada (+1)' },
  { code: '+1', flag: '🇺🇸', label: '+1', fullLabel: 'USA (+1)' },
  { code: '+44', flag: '🇬🇧', label: '+44', fullLabel: 'UK (+44)' },
  { code: '+971', flag: '🇦🇪', label: '+971', fullLabel: 'UAE (+971)' },
  { code: '+61', flag: '🇦🇺', label: '+61', fullLabel: 'Australia (+61)' },
  { code: '+64', flag: '🇳🇿', label: '+64', fullLabel: 'New Zealand (+64)' },
  { code: '+49', flag: '🇩🇪', label: '+49', fullLabel: 'Germany (+49)' },
  { code: '+39', flag: '🇮🇹', label: '+39', fullLabel: 'Italy (+39)' },
  { code: '+65', flag: '🇸🇬', label: '+65', fullLabel: 'Singapore (+65)' },
  { code: '+60', flag: '🇲🇾', label: '+60', fullLabel: 'Malaysia (+60)' },
  { code: '+974', flag: '🇶🇦', label: '+974', fullLabel: 'Qatar (+974)' },
  { code: '+966', flag: '🇸🇦', label: '+966', fullLabel: 'Saudi Arabia (+966)' },
  { code: '+965', flag: '🇰🇼', label: '+965', fullLabel: 'Kuwait (+965)' },
  { code: 'OTHER', flag: '🌐', label: 'Other', fullLabel: 'Other (+...)' },
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
export const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getCurrentTimeString = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const HOURS_LIST = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
export const MINUTES_LIST = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const getTimeParts = (timeStr) => {
  if (!timeStr) return { hour12: '10', minute: '00', period: 'AM' };
  const parts = String(timeStr).split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) h = 10;
  const m = parts[1] ? String(parts[1]).slice(0, 2).padStart(2, '0') : '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const hour12Str = String(h12).padStart(2, '0');
  return { hour12: hour12Str, minute: m, period };
};

export const build24HourTime = (h12Str, mStr, period) => {
  let h = parseInt(h12Str, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(mStr).padStart(2, '0')}`;
};

export default function BookingModal({ isOpen, onClose }) {
  const { showSuccess, showError } = useToast();
  const { settings } = useSiteSettings();
  const modalAnimation = settings?.booking_modal_animation || 'golden-glow';

  const [formData, setFormData] = useState({
    customer_name: '',
    pickup_location: '',
    destination: '',
    car_name: '',
    pickup_date: getTodayDateString(),
    pickup_time: getCurrentTimeString(),
    marketing_consent: true,
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [customCountryCode, setCustomCountryCode] = useState('');
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [whatsappDigits, setWhatsappDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fleet Cars selection & search state
  const [fleetCars, setFleetCars] = useState(DEFAULT_PRESET_CARS);
  const [loadingFleetCars, setLoadingFleetCars] = useState(false);
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [isCarPickerOpen, setIsCarPickerOpen] = useState(false);

  // Custom Interactive Calendar States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // Sync calendar view month/year if formData.pickup_date changes
  useEffect(() => {
    if (formData.pickup_date) {
      const parts = formData.pickup_date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setCalendarViewDate({ year: y, month: m });
        }
      }
    }
  }, [formData.pickup_date]);

  // Custom Interactive Time Picker States
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const timePickerRef = useRef(null);
  const selectedHourRef = useRef(null);
  const selectedMinuteRef = useRef(null);

  const timeParts = useMemo(() => getTimeParts(formData.pickup_time), [formData.pickup_time]);

  // Auto-scroll selected hour & minute to center when time picker opens
  useEffect(() => {
    if (isTimePickerOpen) {
      const timer = setTimeout(() => {
        selectedHourRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        selectedMinuteRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isTimePickerOpen]);

  // Click outside to close custom calendar & time picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setIsTimePickerOpen(false);
      }
    };
    if (isCalendarOpen || isTimePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isCalendarOpen, isTimePickerOpen]);

  const handleSelectHour = (h) => {
    const { minute, period } = getTimeParts(formData.pickup_time);
    const newTime24 = build24HourTime(h, minute, period);
    setFormData((prev) => ({ ...prev, pickup_time: newTime24 }));
  };

  const handleSelectMinute = (m) => {
    const { hour12, period } = getTimeParts(formData.pickup_time);
    const newTime24 = build24HourTime(hour12, m, period);
    setFormData((prev) => ({ ...prev, pickup_time: newTime24 }));
  };

  const handleSelectPeriod = (p) => {
    const { hour12, minute } = getTimeParts(formData.pickup_time);
    const newTime24 = build24HourTime(hour12, minute, p);
    setFormData((prev) => ({ ...prev, pickup_time: newTime24 }));
  };

  const handleSetNow = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setFormData((prev) => ({ ...prev, pickup_time: `${hh}:${mm}` }));
  };

  const handleAddHours = (hoursToAdd) => {
    const { hour12, minute, period } = getTimeParts(formData.pickup_time);
    let h = parseInt(hour12, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const newH = (h + hoursToAdd) % 24;
    const newTime24 = `${String(newH).padStart(2, '0')}:${minute}`;
    setFormData((prev) => ({ ...prev, pickup_time: newTime24 }));
  };

  // Fetch Fleet Cars
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

  // Lock background web page scrolling when booking modal is open, and restore when closed
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
      };
    }
  }, [isOpen]);

  const calendarDays = useMemo(() => {
    const year = calendarViewDate.year;
    const month = calendarViewDate.month;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday
    const startPadding = (firstDay + 6) % 7; // Monday = 0, Tuesday = 1 ... Sunday = 6

    const items = [];
    for (let i = 0; i < startPadding; i++) {
      items.push({ empty: true, key: `pad-${i}` });
    }
    const todayStr = getTodayDateString();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < todayStr;
      const isSelected = dateStr === formData.pickup_date;
      const isToday = dateStr === todayStr;
      items.push({
        empty: false,
        key: dateStr,
        dayNum: d,
        dateStr,
        isPast,
        isSelected,
        isToday,
      });
    }
    return items;
  }, [calendarViewDate.year, calendarViewDate.month, formData.pickup_date]);

  const handlePrevMonth = (e) => {
    e?.stopPropagation?.();
    const today = new Date();
    const isCurrentMonthOrEarlier =
      calendarViewDate.year < today.getFullYear() ||
      (calendarViewDate.year === today.getFullYear() && calendarViewDate.month <= today.getMonth());
    if (isCurrentMonthOrEarlier) return;

    setCalendarViewDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = (e) => {
    e?.stopPropagation?.();
    setCalendarViewDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleSelectDate = (dateStr) => {
    setFormData((prev) => ({ ...prev, pickup_date: dateStr }));
    setIsCalendarOpen(false);
    setError('');
  };

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
      trackBookingSubmitted(`${formData.pickup_location || 'Local'} ➔ ${formData.destination || 'Drop'}`);
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
    setIsCalendarOpen(false);
    setIsTimePickerOpen(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        <div className="relative bg-[#121212] border border-zinc-800 rounded-3xl w-full p-4 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        
        {/* Top Checker Pattern Accent */}
        <div className="absolute top-0 left-6 right-6 sm:left-8 sm:right-8 h-1.5 taxi-checker rounded-t-full" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors z-20"
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
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full h-11 sm:h-12 bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl pl-10 pr-4 text-base sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
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
                <div className="flex h-11 sm:h-12 rounded-xl overflow-hidden border border-zinc-800 focus-within:border-taxi-yellow focus-within:ring-1 focus-within:ring-taxi-yellow transition-all bg-zinc-900">
                  {/* Selectable / Changeable Country Code Badge */}
                  {!isCustomCountry ? (
                    <div className="relative bg-zinc-800/90 hover:bg-zinc-750 border-r border-zinc-700/80 flex items-center transition-colors flex-shrink-0 px-2 sm:px-2.5">
                      {/* Visual Display: Compact flag + code + chevron */}
                      <div className="flex items-center space-x-1 pointer-events-none text-xs sm:text-sm font-bold text-taxi-yellow font-mono whitespace-nowrap">
                        <span>{POPULAR_COUNTRY_CODES.find((c) => c.code === countryCode)?.flag || '🌐'}</span>
                        <span>{countryCode}</span>
                        <ChevronDown className="w-3 h-3 text-taxi-yellow flex-shrink-0" />
                      </div>

                      {/* Native HTML Select overlay (invisible, handles click and native dropdown) */}
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Click to change country code"
                      >
                        {POPULAR_COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.flag} value={c.code} className="bg-zinc-900 text-white font-sans py-1">
                            {c.flag} {c.fullLabel || `${c.label} (${c.code})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center bg-zinc-800/90 border-r border-zinc-700/80 px-1.5 sm:px-2 h-full flex-shrink-0">
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
                        className="w-14 bg-zinc-900 text-taxi-yellow text-xs sm:text-sm font-mono font-black py-1 px-1 rounded border border-zinc-700 outline-none text-center focus:border-taxi-yellow"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCountry(false);
                          setCountryCode('+91');
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white ml-1 p-1 rounded hover:bg-zinc-800"
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
                    className="w-full h-full bg-transparent px-2.5 sm:px-3.5 text-sm sm:text-base text-white placeholder-zinc-500 font-mono tracking-normal sm:tracking-wide outline-none min-w-0"
                  />

                  {isPhoneValid && (
                    <div className="pr-2 sm:pr-3 flex items-center text-emerald-400 flex-shrink-0" title="Valid phone number">
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

              {/* Pickup Date & Time Row - Perfectly balanced side-by-side on mobile & desktop */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {/* Pickup Date */}
                <div className="relative" ref={calendarRef}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 truncate">
                    Pickup Date <span className="text-taxi-yellow">*</span>
                  </label>
                  
                  {/* Clickable Pickup Date Trigger Box */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCalendarOpen(!isCalendarOpen);
                      setIsTimePickerOpen(false);
                    }}
                    className={`w-full h-11 sm:h-12 bg-zinc-900 border rounded-xl px-2 sm:px-3 flex items-center justify-between text-white transition-all cursor-pointer ${
                      isCalendarOpen 
                        ? 'border-taxi-yellow ring-1 ring-taxi-yellow shadow-lg shadow-taxi-yellow/10' 
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                    title="Click to select pickup date"
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-taxi-yellow flex-shrink-0" />
                      <span className="font-mono font-bold text-white text-xs sm:text-sm tracking-tight sm:tracking-normal whitespace-nowrap">
                        {formatDateSlash(formData.pickup_date)}
                      </span>
                    </div>
                    <div className="flex items-center flex-shrink-0 pl-1">
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180 text-taxi-yellow' : ''}`} />
                    </div>
                  </button>

                  {/* Hidden form input for standard form submission */}
                  <input
                    type="hidden"
                    name="pickup_date"
                    value={formData.pickup_date}
                  />

                  {/* Custom Interactive Calendar Popover */}
                  {isCalendarOpen && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-[280px] xs:w-[295px] sm:w-[310px] bg-[#141416] border border-zinc-700/90 rounded-2xl p-3.5 shadow-2xl shadow-black/95 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                      style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.9))' }}
                    >
                      {/* Top Header: Quick Chips (Today / Tomorrow) */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800/80">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Select Date
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectDate(getTodayDateString())}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              formData.pickup_date === getTodayDateString()
                                ? 'bg-taxi-yellow text-black shadow-sm font-extrabold'
                                : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                            }`}
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDate(getTomorrowDateString())}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              formData.pickup_date === getTomorrowDateString()
                                ? 'bg-taxi-yellow text-black shadow-sm font-extrabold'
                                : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                            }`}
                          >
                            Tomorrow
                          </button>
                        </div>
                      </div>

                      {/* Month & Year Navigation Row */}
                      <div className="flex items-center justify-between mb-2.5 px-0.5">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          disabled={
                            calendarViewDate.year < new Date().getFullYear() ||
                            (calendarViewDate.year === new Date().getFullYear() && calendarViewDate.month <= new Date().getMonth())
                          }
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                          {MONTH_NAMES[calendarViewDate.month]} {calendarViewDate.year}
                        </span>

                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Day of Week Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {WEEK_DAYS.map((day) => (
                          <div key={day} className="text-[10px] font-bold text-zinc-400 uppercase py-0.5">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((item) => {
                          if (item.empty) {
                            return <div key={item.key} className="h-7 sm:h-8" />;
                          }

                          if (item.isPast) {
                            return (
                              <button
                                key={item.key}
                                type="button"
                                disabled
                                className="h-7 sm:h-8 rounded-lg text-xs font-medium text-zinc-600 line-through opacity-30 cursor-not-allowed flex items-center justify-center"
                              >
                                {item.dayNum}
                              </button>
                            );
                          }

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleSelectDate(item.dateStr)}
                              className={`h-7 sm:h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                                item.isSelected
                                  ? 'bg-taxi-yellow text-black font-black shadow-md shadow-taxi-yellow/30 scale-105'
                                  : item.isToday
                                  ? 'border border-taxi-yellow/70 text-taxi-yellow hover:bg-zinc-800'
                                  : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                              }`}
                            >
                              {item.dayNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer notice */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 px-0.5 font-mono">
                        <span>Format: <strong>DD/MM/YYYY</strong></span>
                        <span className="text-taxi-yellow font-bold">{formatDateSlash(formData.pickup_date)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pickup Time */}
                <div className="relative" ref={timePickerRef}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 truncate">
                    Pickup Time <span className="text-taxi-yellow">*</span>
                  </label>
                  
                  {/* Clickable Pickup Time Trigger Box */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimePickerOpen(!isTimePickerOpen);
                      setIsCalendarOpen(false);
                    }}
                    className={`w-full h-11 sm:h-12 bg-zinc-900 border rounded-xl px-2 sm:px-3 flex items-center justify-between text-white transition-all cursor-pointer ${
                      isTimePickerOpen 
                        ? 'border-taxi-yellow ring-1 ring-taxi-yellow shadow-lg shadow-taxi-yellow/10' 
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                    title="Click to select pickup time"
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-taxi-yellow flex-shrink-0" />
                      <span className="font-mono font-bold text-white text-xs sm:text-sm tracking-tight sm:tracking-normal whitespace-nowrap">
                        {formatISTTime(formData.pickup_time)}
                      </span>
                    </div>
                    <div className="flex items-center flex-shrink-0 pl-1">
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isTimePickerOpen ? 'rotate-180 text-taxi-yellow' : ''}`} />
                    </div>
                  </button>

                  {/* Hidden form input for standard form submission */}
                  <input
                    type="hidden"
                    name="pickup_time"
                    value={formData.pickup_time}
                  />

                  {/* Custom Interactive Dark Theme Time Picker Popover */}
                  {isTimePickerOpen && (
                    <div 
                      className="absolute top-full right-0 mt-2 w-[280px] xs:w-[295px] sm:w-[310px] bg-[#141416] border border-zinc-700/90 rounded-2xl p-3.5 shadow-2xl shadow-black/95 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                      style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.9))' }}
                    >
                      {/* Top Header: Quick Chips */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800/80">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Select Time
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={handleSetNow}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                          >
                            Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddHours(1)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                          >
                            +1 Hr
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddHours(2)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                          >
                            +2 Hr
                          </button>
                        </div>
                      </div>

                      {/* Live Selected Time Banner */}
                      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-taxi-yellow" />
                          <span className="text-base font-black font-mono text-white tracking-wider">
                            {timeParts.hour12}:{timeParts.minute}
                          </span>
                        </div>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-taxi-yellow text-black font-mono">
                          {timeParts.period} IST
                        </span>
                      </div>

                      {/* 3 Columns: Hour | Minute | Period */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Hour Column */}
                        <div className="flex flex-col">
                          <div className="text-[10px] font-bold uppercase text-zinc-400 text-center pb-1">
                            Hour
                          </div>
                          <div className="h-40 overflow-y-auto rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-1 space-y-1">
                            {HOURS_LIST.map((h) => {
                              const isSelected = h === timeParts.hour12;
                              return (
                                <button
                                  key={h}
                                  ref={isSelected ? selectedHourRef : null}
                                  type="button"
                                  onClick={() => handleSelectHour(h)}
                                  className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                                    isSelected
                                      ? 'bg-taxi-yellow text-black font-black shadow-md shadow-taxi-yellow/30 scale-105'
                                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                  }`}
                                >
                                  {h}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Minute Column */}
                        <div className="flex flex-col">
                          <div className="text-[10px] font-bold uppercase text-zinc-400 text-center pb-1">
                            Minute
                          </div>
                          <div className="h-40 overflow-y-auto rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-1 space-y-1">
                            {MINUTES_LIST.map((m) => {
                              const isSelected = m === timeParts.minute;
                              return (
                                <button
                                  key={m}
                                  ref={isSelected ? selectedMinuteRef : null}
                                  type="button"
                                  onClick={() => handleSelectMinute(m)}
                                  className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                                    isSelected
                                      ? 'bg-taxi-yellow text-black font-black shadow-md shadow-taxi-yellow/30 scale-105'
                                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                  }`}
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Period Column (AM / PM) */}
                        <div className="flex flex-col">
                          <div className="text-[10px] font-bold uppercase text-zinc-400 text-center pb-1">
                            AM / PM
                          </div>
                          <div className="h-40 rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-1 flex flex-col justify-center space-y-2">
                            {['AM', 'PM'].map((p) => {
                              const isSelected = p === timeParts.period;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => handleSelectPeriod(p)}
                                  className={`w-full py-3 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                                    isSelected
                                      ? 'bg-taxi-yellow text-black font-black shadow-md shadow-taxi-yellow/30 scale-105'
                                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                  }`}
                                >
                                  {p}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Footer: Format info & Done button */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500 font-mono">Format: 12-Hour (IST)</span>
                        <button
                          type="button"
                          onClick={() => setIsTimePickerOpen(false)}
                          className="px-3.5 py-1 bg-taxi-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pickup Location (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Pickup Location <span className="text-zinc-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    placeholder="e.g. Model Town, Jalandhar / Home"
                    className="w-full h-11 sm:h-12 bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl pl-10 pr-4 text-base sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Destination (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Destination <span className="text-zinc-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Amritsar Airport, Chandigarh, Delhi NCR"
                    className="w-full h-11 sm:h-12 bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl pl-10 pr-4 text-base sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
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
                  className="w-full h-11 sm:h-12 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus-within:border-taxi-yellow rounded-xl px-3.5 text-base sm:text-sm text-white flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate min-w-0">
                    <Car className="w-4 h-4 text-taxi-yellow flex-shrink-0" />
                    {formData.car_name ? (
                      <span className="font-bold text-white truncate text-xs sm:text-sm">{formData.car_name}</span>
                    ) : (
                      <span className="text-zinc-400 text-xs sm:text-sm truncate">Any Available Cab (Optional)</span>
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
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-base sm:text-xs text-white placeholder-zinc-500 outline-none focus:border-taxi-yellow"
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
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  By clicking Book Now, you agree to our{' '}
                  <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-taxi-yellow underline decoration-zinc-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-taxi-yellow underline decoration-zinc-700">
                    Privacy Policy
                  </a>.
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
                      {formatISTDate(successResult.pickup_date) || 'Today'} {successResult.pickup_time ? `at ${formatISTTime(successResult.pickup_time)}` : ''}
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
