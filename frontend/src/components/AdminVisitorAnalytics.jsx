import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  PhoneCall, 
  MessageCircle, 
  MousePointerClick, 
  Smartphone, 
  Monitor, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  Activity, 
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  BarChart3,
  Zap
} from 'lucide-react';
import { getAdminAnalyticsStats } from '../api/client';
import AdminGA4NativeAnalytics from './AdminGA4NativeAnalytics';
import { formatISTTime, formatISTDate, formatISTDateTime, formatISTTimeAgo } from '../utils/dateTime';

export default function AdminVisitorAnalytics() {
  const [activeTab, setActiveTab] = useState('inhouse');
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (period = days, isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminAnalyticsStats(period);
      setData(res);
    } catch (err) {
      console.warn("Could not load analytics stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(days);
  }, [days]);

  // Parse UTC date string safely ensuring UTC interpretation
  const parseUtcDate = (dateStr) => {
    if (!dateStr) return new Date();
    let s = String(dateStr).trim();
    if (s.includes('T') && !s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
      s += 'Z';
    } else if (!s.includes('T') && !s.endsWith('Z')) {
      s = s.replace(' ', 'T') + 'Z';
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date(dateStr) : d;
  };

  // Format accurate relative time (Just now, 2m ago, etc.)
  const formatTimeAgo = (dateStr) => {
    return formatISTTimeAgo(dateStr);
  };

  // Format exact local time with AM/PM (e.g. 07:14:34 PM)
  const formatExactTime = (dateStr) => {
    return formatISTTime(dateStr, true);
  };

  // Get readable icon and color for event types
  const getEventBadge = (type) => {
    switch (type) {
      case 'click_call':
        return { label: 'Call Click', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: PhoneCall };
      case 'click_whatsapp':
        return { label: 'WhatsApp', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: MessageCircle };
      case 'click_book_ride':
      case 'open_booking_modal':
        return { label: 'Modal Opened', color: 'bg-taxi-yellow/15 text-taxi-yellow border-taxi-yellow/30', icon: MousePointerClick };
      case 'submit_booking':
        return { label: 'Ride Booked', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', icon: CheckCircle2 };
      case 'click_route':
        return { label: 'Route Click', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30', icon: MapPin };
      default:
        return { label: 'Page View', color: 'bg-zinc-800 text-zinc-300 border-zinc-700', icon: Eye };
    }
  };

  const deviceTotal = (data?.device_breakdown?.Mobile || 0) + (data?.device_breakdown?.Desktop || 0) + (data?.device_breakdown?.Tablet || 0) || 1;
  const mobilePct = Math.round(((data?.device_breakdown?.Mobile || 0) / deviceTotal) * 100) || 0;
  const desktopPct = Math.round(((data?.device_breakdown?.Desktop || 0) / deviceTotal) * 100) || 0;

  // Max value for daily trend bars
  const maxTrend = data?.daily_trends?.reduce((max, d) => Math.max(max, d.pageviews, d.visitors), 1) || 1;

  return (
    <div className="space-y-6">
      {/* Top Analytics View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('inhouse')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'inhouse'
                ? 'bg-taxi-yellow text-black shadow-lg shadow-taxi-yellow/20'
                : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>In-House Live Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('ga4_api')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'ga4_api'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Google Analytics 4 (API)</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
          {activeTab === 'inhouse' ? '⚡ 100% Private In-House Engine' : '🌐 Official Google Analytics 4 Data API'}
        </span>
      </div>

      <div className={activeTab === 'ga4_api' ? 'block' : 'hidden'}>
        <AdminGA4NativeAnalytics />
      </div>

      <div className={activeTab === 'inhouse' ? 'block' : 'hidden'}>
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-7 relative overflow-hidden">
          {/* Background radial gradient accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-taxi-yellow/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-850/80 pb-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Real-Time Tracker Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center space-x-2">
            <span>Website Visitors &amp; Click Analytics</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track daily website visits, button clicks, helpline calls, and booking conversion drop-offs.
          </p>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center space-x-1">
            {[7, 14, 30].map((p) => (
              <button
                key={p}
                onClick={() => setDays(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  days === p
                    ? 'bg-taxi-yellow text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p} Days
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(days, true)}
            disabled={loading || refreshing}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2.5 rounded-xl border border-zinc-800 transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-taxi-yellow' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Live Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        
        {/* Card 1: Today Unique Visitors */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-taxi-yellow/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Today's Visitors</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-taxi-yellow flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {loading ? '—' : (data?.today_visitors ?? 0)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 flex items-center space-x-1">
            <span>{days}-day total:</span>
            <strong className="text-zinc-200">{data?.total_visitors_period ?? 0} unique visitors</strong>
          </p>
        </div>

        {/* Card 2: Today Page Views */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-taxi-yellow/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Today's Page Views</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {loading ? '—' : (data?.today_pageviews ?? 0)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 flex items-center space-x-1">
            <span>{days}-day total:</span>
            <strong className="text-zinc-200">{data?.total_pageviews_period ?? 0} views</strong>
          </p>
        </div>

        {/* Card 3: Today's High-Intent Actions (Calls & WhatsApp) */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-taxi-yellow/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Today's Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white flex items-baseline space-x-3">
            <span className="text-amber-300" title="Calls">{data?.today_calls ?? 0} <span className="text-xs text-zinc-500 font-normal">calls</span></span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400" title="WhatsApp">{data?.today_whatsapps ?? 0} <span className="text-xs text-zinc-500 font-normal">wa</span></span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            High-intent customer contact clicks
          </p>
        </div>

        {/* Card 4: Conversion Rate (Modal Opens -> Bookings) */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-taxi-yellow/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Booking Funnel</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-taxi-yellow flex items-baseline space-x-2">
            <span>{loading ? '—' : `${data?.conversion_rate ?? 0}%`}</span>
            <span className="text-xs text-zinc-400 font-medium">conversion</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            {data?.today_bookings ?? 0} booked from {data?.today_modal_opens ?? 0} form opens
          </p>
        </div>

      </div>

      {/* Daily Activity Chart / Trends */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-taxi-yellow" />
              <span>Daily Traffic Trend (Last {days} Days)</span>
            </h3>
            <p className="text-xs text-zinc-400">Day-by-day unique visitors and pageviews</p>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-taxi-yellow" />
              <span>Visitors</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-blue-500/80" />
              <span>Page Views</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-purple-500" />
              <span>Bookings</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-4 overflow-x-auto">
          <div className="min-w-[500px] flex items-end justify-between gap-3 h-40 border-b border-zinc-800 pb-2">
            {data?.daily_trends?.map((point, idx) => {
              const vHeight = point.visitors > 0 ? Math.max(8, Math.round((point.visitors / maxTrend) * 120)) : 2;
              const pHeight = point.pageviews > 0 ? Math.max(8, Math.round((point.pageviews / maxTrend) * 120)) : 2;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-700 text-white text-[10px] rounded-lg py-1 px-2 mb-2 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    <p className="font-bold">{point.date}</p>
                    <p className="text-taxi-yellow">Visitors: {point.visitors}</p>
                    <p className="text-blue-300">Views: {point.pageviews}</p>
                    <p className="text-purple-300">Bookings: {point.bookings}</p>
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center space-x-1">
                    <div 
                      style={{ height: `${vHeight}px` }} 
                      className="w-3 sm:w-4 rounded-t bg-taxi-yellow transition-all duration-300 group-hover:brightness-125" 
                      title={`${point.visitors} visitors`}
                    />
                    <div 
                      style={{ height: `${pHeight}px` }} 
                      className="w-3 sm:w-4 rounded-t bg-blue-500/70 transition-all duration-300 group-hover:brightness-125" 
                      title={`${point.pageviews} pageviews`}
                    />
                  </div>

                  <span className="text-[10px] text-zinc-500 mt-2 font-mono">
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-Column Deep Dive: Left = Click & Device Breakdown, Right = Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Breakdown & Devices (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Clicks Breakdown */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MousePointerClick className="w-4 h-4 text-taxi-yellow" />
              <span>Button &amp; Route Clicks ({days} Days)</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(data?.clicks_by_category || {}).map(([cat, count], idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{cat}</span>
                  <span className="font-mono font-bold text-white bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
                    {count} clicks
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Split */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-taxi-yellow" />
              <span>Device Split ({days} Days)</span>
            </h3>

            <div className="space-y-3">
              {/* Mobile Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300 flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Mobile Phones</span>
                  </span>
                  <span className="font-mono font-bold text-white">{mobilePct}% ({data?.device_breakdown?.Mobile || 0})</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${mobilePct}%` }} className="bg-taxi-yellow h-full rounded-full transition-all duration-500" />
                </div>
              </div>

              {/* Desktop Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300 flex items-center space-x-1.5">
                    <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Desktop Computers</span>
                  </span>
                  <span className="font-mono font-bold text-white">{desktopPct}% ({data?.device_breakdown?.Desktop || 0})</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${desktopPct}%` }} className="bg-blue-400 h-full rounded-full transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Real-Time Activity Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Visitor Activity Stream</span>
                </h3>
                <p className="text-xs text-zinc-400">Live stream of latest actions performed by visitors</p>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Latest {data?.recent_events?.length || 0} Events
              </span>
            </div>

            {/* Event List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {!data?.recent_events || data.recent_events.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No visitor activity recorded yet today. Visit the homepage to see live events stream here!
                </div>
              ) : (
                data.recent_events.map((ev) => {
                  const badge = getEventBadge(ev.event_type);
                  const Icon = badge.icon;

                  return (
                    <div 
                      key={ev.id}
                      className="bg-zinc-950/80 border border-zinc-850/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${badge.color}`}>
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white truncate">
                              {ev.event_label || badge.label}
                            </span>
                            <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                              {ev.device_type}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {ev.page_path} • {ev.browser || 'Browser'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] font-mono font-bold text-zinc-300 block">
                          {formatTimeAgo(ev.created_at)}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {formatExactTime(ev.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-850/80 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Powered by In-House PB08 Analytics Engine</span>
            <span>Zero 3rd party cookies • 100% Privacy</span>
          </div>
        </div>

      </div>
    </div>
    </div>
  </div>
);
}
