import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  MessageSquare,
  RefreshCw,
  Info
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getEligibleOffersCount, sendPromotionalOffer } from '../api/client';

const SAMPLE_TEMPLATES = [
  {
    title: "Weekend Airport Special (15% OFF)",
    text: "Hi {Customer Name}, planning a trip? Get 15% OFF on all airport transfers to Amritsar & Chandigarh this weekend with PB08 TAXI! Reply BOOK to reserve your ride."
  },
  {
    title: "Outstation Hill Station Discount",
    text: "Special offer for {Customer Name}: Escape the heat! Enjoy flat ₹500 off on outstation round-trips to Dharamshala & Manali with sanitized AC cabs from PB08 TAXI."
  },
  {
    title: "Festive Holiday Greeting",
    text: "Warm greetings from PB08 TAXI! Book your family festival travels in advance and get guaranteed priority cab dispatch with verified drivers."
  }
];

export default function AdminOffersPage() {
  const [counts, setCounts] = useState(null);
  const [messageText, setMessageText] = useState(SAMPLE_TEMPLATES[0].text);
  const [loadingCount, setLoadingCount] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const fetchCounts = async () => {
    setLoadingCount(true);
    try {
      const data = await getEligibleOffersCount();
      setCounts(data);
    } catch (err) {
      console.error("Failed to load eligible count:", err);
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      alert("Please enter a promotional message to send.");
      return;
    }

    if (counts?.eligible_customers === 0) {
      alert("There are no customers currently eligible with marketing consent.");
      return;
    }

    const confirmText = `Are you sure you want to broadcast this promotional message to all ${counts?.eligible_customers} opted-in customers?`;
    if (!window.confirm(confirmText)) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await sendPromotionalOffer(messageText.trim());
      setSendResult(res);
      await fetchCounts();
    } catch (err) {
      setSendResult({
        success: false,
        sent_count: 0,
        failed_count: counts?.eligible_customers || 1,
        message: err.response?.data?.detail || "Broadcast failed"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">WhatsApp Promotional Offers</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Dispatch broadcast promotions strictly to customers with verified marketing consent.
            </p>
          </div>
          <button
            onClick={fetchCounts}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCount ? 'animate-spin' : ''}`} />
            <span>Refresh Count</span>
          </button>
        </div>

        {/* Consent Compliance Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Eligible Recipients</span>
            <div className="text-3xl font-black text-taxi-yellow mt-2">
              {loadingCount ? '—' : (counts?.eligible_customers ?? 0)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Opted in for promotional WhatsApp</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Opted Out (Excluded)</span>
            <div className="text-3xl font-black text-zinc-400 mt-2">
              {loadingCount ? '—' : (counts?.opted_out_customers ?? 0)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Safely skipped to prevent spam</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Rate-Pacing Guard</span>
            <div className="text-3xl font-black text-emerald-400 mt-2">
              Active
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Protects WhatsApp account from spam filters</p>
          </div>
        </div>

        {/* Offer Composer */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
                <Send className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Write Your Promotional Message</h2>
                <p className="text-xs text-zinc-400">
                  Use <code className="text-taxi-yellow font-bold bg-zinc-900 px-1 py-0.5 rounded">{'{Customer Name}'}</code> to personalize greetings dynamically.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preset Templates */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Quick Templates
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessageText(tmpl.text)}
                  className="text-left bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-taxi-yellow/50 p-3.5 rounded-2xl transition-all"
                >
                  <p className="text-xs font-bold text-white mb-1">{tmpl.title}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{tmpl.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Result Alert */}
          {sendResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
              sendResult.success 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' 
                : 'bg-red-950/60 border-red-800 text-red-200'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {sendResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                <span>Broadcast Completed</span>
              </div>
              <p>Successfully dispatched to: <span className="font-bold text-white">{sendResult.sent_count}</span> customer(s).</p>
              {sendResult.failed_count > 0 && (
                <p className="text-rose-300">Failed / offline: <span className="font-bold">{sendResult.failed_count}</span> customer(s).</p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSendOffer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Message Content
              </label>
              <textarea
                rows={5}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your promotional offer here..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-2xl p-4 text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>

            {/* Live Message Preview */}
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">Customer WhatsApp Preview</span>
              <p className="italic text-zinc-300">
                "{messageText.replace('{Customer Name}', 'Harpreet Singh').replace('{name}', 'Harpreet Singh')}"
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Will be sent to <strong>{counts?.eligible_customers ?? 0}</strong> verified consented customers.
              </span>

              <button
                type="submit"
                disabled={sending || (counts?.eligible_customers === 0)}
                className="bg-taxi-yellow hover:bg-taxi-yellowHover disabled:opacity-50 text-black font-extrabold px-8 py-4 rounded-xl text-sm shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting with Rate Pacing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Offer to All</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

      </div>
    </AdminLayout>
  );
}
