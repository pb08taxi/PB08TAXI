import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { createBooking } from '../api/client';

export default function BookingModal({ isOpen, onClose }) {
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
    pickup_date: getTodayDateString(),
    pickup_time: getCurrentTimeString(),
    marketing_consent: true,
  });

  const [whatsapp10, setWhatsapp10] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

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

    const cleanDigits = whatsapp10.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setError('Please enter your complete 10-digit WhatsApp phone number (e.g. 98765 43210).');
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
        whatsapp_number: `+91${cleanDigits}`,
      };
      const res = await createBooking(payload);
      setSuccessResult(res);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit booking. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
    setWhatsapp10('');
    setFormData({
      customer_name: '',
      pickup_location: '',
      destination: '',
      pickup_date: getTodayDateString(),
      pickup_time: getCurrentTimeString(),
      marketing_consent: true,
    });
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

      {/* Modal Dialog */}
      <div className="relative bg-[#121212] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-white z-10 animate-pulse-subtle max-h-[92vh] overflow-y-auto">
        
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

              {/* WhatsApp Number with separated +91 and 10 Digit Lock */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>
                    WhatsApp Number <span className="text-taxi-yellow">*</span>
                  </span>
                  <span className={`text-[11px] font-mono ${whatsapp10.length === 10 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {whatsapp10.length}/10 digits
                  </span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-zinc-800 focus-within:border-taxi-yellow focus-within:ring-1 focus-within:ring-taxi-yellow transition-all">
                  {/* Visually separated +91 country badge */}
                  <div className="bg-zinc-800/90 px-3.5 py-3 text-xs sm:text-sm font-bold text-taxi-yellow border-r border-zinc-700 select-none flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span className="font-mono font-black tracking-wider">+91</span>
                  </div>
                  {/* Strictly locked 10-digit input */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={whatsapp10}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setWhatsapp10(digits);
                      setError('');
                    }}
                    placeholder="98765 43210"
                    className="w-full bg-zinc-900 py-3 px-3.5 text-sm text-white placeholder-zinc-500 font-mono tracking-wider outline-none"
                  />
                  {whatsapp10.length === 10 && (
                    <div className="pr-3 flex items-center bg-zinc-900 text-emerald-400 flex-shrink-0" title="Valid 10-digit number">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {whatsapp10.length === 10 ? (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center space-x-1">
                    <span>✓</span>
                    <span>Dispatches to: <strong>+91{whatsapp10}</strong> with live confirmation.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Enter your 10-digit mobile number. Country code <strong>+91</strong> is auto-attached.
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
  );
}
