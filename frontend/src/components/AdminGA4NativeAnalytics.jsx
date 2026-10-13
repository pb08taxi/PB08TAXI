import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Users, 
  Clock, 
  Globe, 
  TrendingUp, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Smartphone, 
  Monitor, 
  Share2,
  Search,
  Check,
  ShieldCheck,
  Trash2,
  Copy
} from 'lucide-react';
import { getGA4Status, saveGA4Credentials, deleteGA4Credentials, getGA4DashboardData } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function AdminGA4NativeAnalytics() {
  const { showSuccess, showError } = useToast();

  const [days, setDays] = useState(7);
  const [status, setStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('pb08_ga4_status');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { connected: true, property_id: '558570751', measurement_id: 'G-MD0W9GNM7V' };
  });

  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem('pb08_ga4_cached_data');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('pb08_ga4_cached_data');
    } catch (e) {
      return true;
    }
  });
  const [refreshing, setRefreshing] = useState(false);

  // Modal for API Credentials
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [propertyIdInput, setPropertyIdInput] = useState('558570751');
  const [savingCredentials, setSavingCredentials] = useState(false);

  const fetchStatusAndData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const statusRes = await getGA4Status();
      setStatus(statusRes);
      try {
        localStorage.setItem('pb08_ga4_status', JSON.stringify(statusRes));
      } catch (e) {}

      if (statusRes?.property_id) {
        setPropertyIdInput(statusRes.property_id);
      }

      if (statusRes.connected) {
        const dataRes = await getGA4DashboardData(days);
        setData(dataRes);
        try {
          localStorage.setItem('pb08_ga4_cached_data', JSON.stringify(dataRes));
        } catch (e) {}
      } else {
        setData(null);
        try {
          localStorage.removeItem('pb08_ga4_cached_data');
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load GA4 API data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatusAndData();
  }, [days]);

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      showError('Please paste your Google Cloud Service Account JSON key.');
      return;
    }
    setSavingCredentials(true);
    try {
      const res = await saveGA4Credentials(jsonInput.trim(), propertyIdInput.trim());
      if (res.connected) {
        showSuccess('Google Analytics 4 API successfully connected!');
        setStatus(res);
        try {
          localStorage.setItem('pb08_ga4_status', JSON.stringify(res));
        } catch (e) {}
        setShowConfigModal(false);
        setJsonInput('');
        fetchStatusAndData(true);
      } else {
        showError(res.error || 'Failed to authenticate with Google API.');
      }
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save GA4 credentials. Check JSON format.');
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Analytics 4 API?')) return;
    try {
      await deleteGA4Credentials();
      showSuccess('GA4 API credentials removed.');
      const dis = { connected: false, property_id: '558570751', measurement_id: 'G-MD0W9GNM7V' };
      setStatus(dis);
      setData(null);
      try {
        localStorage.setItem('pb08_ga4_status', JSON.stringify(dis));
        localStorage.removeItem('pb08_ga4_cached_data');
      } catch (e) {}
    } catch (err) {
      showError('Failed to remove credentials.');
    }
  };

  const maxTrend = data?.trends?.reduce((m, d) => Math.max(m, d.users, d.sessions), 1) || 1;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Controls */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-850/80 pb-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${status?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`text-xs font-extrabold uppercase tracking-widest ${status?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status?.connected ? 'Official Google Analytics 4 API Active' : 'GA4 API Setup Required'}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center space-x-2.5">
              <span>Google Analytics 4 (Native API)</span>
            </h2>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-lg">
                Property: #{status?.property_id || '558570751'}
              </span>
              <span className="text-[11px] font-mono bg-blue-950/60 border border-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded-lg">
                GA4 ID: G-MD0W9GNM7V
              </span>
              {status?.client_email && (
                <span className="text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-lg truncate max-w-xs">
                  SA: {status.client_email}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Days filter */}
            <div className="inline-flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    days === d
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchStatusAndData(true)}
              disabled={refreshing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-taxi-yellow rounded-xl text-xs font-bold border border-taxi-yellow/30 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{status?.connected ? 'API Key Settings' : 'Connect GA4 API'}</span>
            </button>

            <a
              href={`https://analytics.google.com/analytics/web/#/p${status?.property_id || '558570751'}/realtime`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Cloud</span>
            </a>
          </div>
        </div>

        {/* State A: ONLY when GA4 API is genuinely NOT connected and NOT loading */}
        {!loading && status && status.connected === false && (
          <div className="bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-blue-950/20 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-taxi-yellow bg-taxi-yellow/10 px-3 py-1 rounded-full border border-taxi-yellow/20">
                  <Zap className="w-3.5 h-3.5" />
                  <span>100% Native API • Zero Iframes • Dark Theme</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-2">
                  Connect Official Google Analytics 4 API
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                  Looker Studio ke slow iframe embed ke bajaye ab aapka Google Analytics direct official Google Analytics Data API ke zariye connect hoga. A to Z metrics (Live Realtime, Traffic Acquisition, Cities) directly aapke website dashboard par load hongi!
                </p>
              </div>

              <button
                onClick={() => setShowConfigModal(true)}
                className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex-shrink-0"
              >
                <Key className="w-4 h-4" />
                <span>Connect API (2 Min Setup)</span>
              </button>
            </div>

            {/* Quick 3-Step Setup Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-850">
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">
                  1
                </div>
                <h4 className="text-xs font-bold text-white">Google Cloud Service Account</h4>
                <p className="text-[11px] text-zinc-400">
                  <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    Google Cloud Console
                  </a> me jakar free Service Account banayein aur "Google Analytics Data API" enable karein.
                </p>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-taxi-yellow/20 border border-taxi-yellow/30 flex items-center justify-center text-taxi-yellow font-black text-xs">
                  2
                </div>
                <h4 className="text-xs font-bold text-white">GA4 Me Viewer Access Dein</h4>
                <p className="text-[11px] text-zinc-400">
                  Service Account ka email copy karein aur <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-taxi-yellow underline">Google Analytics</a> Property (<strong>#558570751</strong>) ke Access Management me Viewer add karein.
                </p>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
                  3
                </div>
                <h4 className="text-xs font-bold text-white">JSON Key Paste Karein</h4>
                <p className="text-[11px] text-zinc-400">
                  Google Cloud se downloaded JSON key file ko open karke yahan paste karein. System instantly verify karke live metrics load kar dega!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State B: When GA4 API IS CONNECTED or Loading */}
        {(status?.connected || loading) && (
          <div className="space-y-6">
            
            {/* Warning: ONLY when genuine GA4 Permission / 403 Error occurs */}
            {!loading && data && data.connected === false && Boolean(data.error) && (
              <div className="bg-amber-950/40 border border-amber-500/70 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-amber-300 flex items-center space-x-2">
                        <span>Action Required: Add Service Account to Google Analytics</span>
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/40">
                          Error 403 (Permission Denied)
                        </span>
                      </h4>
                      <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                        Aapka Google Cloud JSON bilkul valid hai! Lekin is Service Account email ko Google Analytics Property <strong>#{status?.property_id || '558570751'}</strong> me <strong>Viewer</strong> access dena baaki hai.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (status?.client_email) {
                          navigator.clipboard.writeText(status.client_email);
                          showSuccess('Service Account email copied to clipboard!');
                        }
                      }}
                      className="px-3.5 py-2 bg-taxi-yellow hover:bg-taxi-yellowHover text-black text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </button>
                    <a
                      href="https://analytics.google.com/analytics/web/#/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-700 transition-all flex items-center space-x-1.5"
                    >
                      <span>Open GA4 Admin</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="bg-black/50 border border-amber-900/50 rounded-xl p-4 text-xs text-zinc-300 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <span>📌 Bas yeh 3 aasan steps follow karein:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-300 leading-relaxed pl-1">
                    <li>
                      Apne <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-taxi-yellow underline font-bold">Google Analytics</a> me jayein ➔ Niche left corner me <strong>Admin (Gear icon)</strong> par click karein.
                    </li>
                    <li>
                      Property column me <strong>Property Access Management</strong> par click karein ➔ Upar right me <strong>"+" button ➔ Add users</strong> dabayein.
                    </li>
                    <li>
                      Yeh email paste karein: <strong className="text-white bg-zinc-800 px-2 py-0.5 rounded font-mono select-all text-xs border border-zinc-700">{status?.client_email || 'Service Account Email'}</strong> ➔ Role <strong>"Viewer"</strong> select karein aur <strong>Add</strong> dabayein.
                    </li>
                  </ol>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    Add karte hi upar <strong>"Refresh"</strong> button dabayein, live visitors aur analytics data turant show hona shuru ho jayega!
                  </p>
                </div>
              </div>
            )}

            {/* Skeleton while first time loading without cache */}
            {loading && !data && (
              <div className="space-y-6 animate-pulse">
                <div className="h-24 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 flex items-center px-6">
                  <div className="flex items-center space-x-3 text-sm text-zinc-400">
                    <RefreshCw className="w-4 h-4 animate-spin text-taxi-yellow" />
                    <span>Loading Google Analytics 4 live data...</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-28 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
                  ))}
                </div>
                <div className="h-44 bg-zinc-900/40 rounded-2xl border border-zinc-800/80" />
              </div>
            )}

            {/* Dashboard Content (Rendered when data is available) */}
            {data && (
              <>
                {/* Realtime Live Counter Banner */}
                <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-emerald-950/40 border border-blue-900/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <ActivityPulse className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      GA4 Real-Time Active Now
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-3xl font-black text-white font-mono">
                      {data?.realtime_active_users || 0}
                    </span>
                    <span className="text-xs text-zinc-400">
                      visitors on website in last 30 minutes
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400">
                {Object.entries(data?.realtime_devices || {}).map(([dev, cnt], idx) => (
                  <span key={idx} className="bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                    {dev}: <strong className="text-white">{cnt}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {data?.total_users || 0}
                </div>
                <p className="text-[11px] text-zinc-500">Official GA4 Unique Visitors ({days}D)</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sessions</span>
                  <TrendingUp className="w-4 h-4 text-taxi-yellow" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {data?.total_sessions || 0}
                </div>
                <p className="text-[11px] text-zinc-500">Total Visits &amp; Engagements ({days}D)</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Screen Views</span>
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {data?.total_views || 0}
                </div>
                <p className="text-[11px] text-zinc-500">Total GA4 Pageviews ({days}D)</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Avg. Time</span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {data?.avg_engagement_time ? `${Math.round(data.avg_engagement_time)}s` : '0s'}
                </div>
                <p className="text-[11px] text-zinc-500">Average Session Duration ({days}D)</p>
              </div>
            </div>

            {/* Daily Traffic Trend (Full Width Card) */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-taxi-yellow" />
                    <span>Daily Traffic Trend (Users vs Sessions)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">Google Analytics 4 activity over the last {days} days</p>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                    <span className="text-zinc-400">Users</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-taxi-yellow" />
                    <span className="text-zinc-400">Sessions</span>
                  </span>
                </div>
              </div>

              {/* Trend Bars */}
              <div className="pt-4 overflow-x-auto">
                <div className="min-w-[500px] flex items-end justify-between gap-3 h-40 border-b border-zinc-800 pb-2">
                  {data?.trends?.map((t, idx) => {
                    const uHeight = t.users > 0 ? Math.max(12, Math.round((t.users / maxTrend) * 115)) : 4;
                    const sHeight = t.sessions > 0 ? Math.max(12, Math.round((t.sessions / maxTrend) * 115)) : 4;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end group">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-700 text-white text-[10px] rounded-lg py-1 px-2 mb-2 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                          <p className="font-bold">{t.date}</p>
                          <p className="text-blue-400">Users: {t.users}</p>
                          <p className="text-taxi-yellow">Sessions: {t.sessions}</p>
                        </div>
                        {t.users > 0 && (
                          <span className="text-[10px] font-bold text-blue-400 mb-1 font-mono">
                            {t.users}
                          </span>
                        )}
                        <div className="w-full flex items-end justify-center space-x-1 sm:space-x-1.5">
                          <div
                            style={{ height: `${uHeight}px` }}
                            className={`w-3.5 sm:w-5 rounded-t transition-all ${
                              t.users > 0 ? 'bg-blue-500 shadow-sm shadow-blue-500/50 group-hover:brightness-125' : 'bg-zinc-800/80'
                            }`}
                          />
                          <div
                            style={{ height: `${sHeight}px` }}
                            className={`w-3.5 sm:w-5 rounded-t transition-all ${
                              t.sessions > 0 ? 'bg-taxi-yellow shadow-sm shadow-yellow-500/50 group-hover:brightness-125' : 'bg-zinc-800/50'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-2 font-mono">{t.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Deep Dive Grid: Top User Cities & Traffic Sources (Side-by-Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Top Cities */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-taxi-yellow" />
                    <span>Top User Cities (Punjab &amp; NCR)</span>
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {!data?.top_cities || data.top_cities.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-3">No city data recorded yet in this time frame.</p>
                  ) : (
                    data.top_cities.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{c.city}</span>
                        <span className="font-mono font-bold text-white bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                          {c.users} users
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Traffic Acquisition Sources */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Traffic Sources (Google Search, Direct)</span>
                </h3>

                <div className="space-y-2.5">
                  {!data?.traffic_sources || data.traffic_sources.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-3">No traffic source data recorded yet.</p>
                  ) : (
                    data.traffic_sources.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{s.source}</span>
                        <span className="font-mono font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60">
                          {s.sessions} sessions
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* Modal: Setup & Update GA4 API Credentials */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-900/60 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure Google Cloud Service Account</span>
              </div>
              <h3 className="text-xl font-black text-white">Google Analytics 4 API Credentials</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Paste your Google Cloud Service Account JSON file contents. Data will be fetched privately and securely via Google's official API.
              </p>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  GA4 Property ID
                </label>
                <input
                  type="text"
                  value={propertyIdInput}
                  onChange={(e) => setPropertyIdInput(e.target.value)}
                  placeholder="558570751"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Service Account JSON Key
                </label>
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{\n  "type": "service_account",\n  "project_id": "pb08-taxi",\n  "private_key_id": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "pb08-analytics@...iam.gserviceaccount.com",\n  ...\n}'
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl p-3.5 text-xs text-white outline-none font-mono"
                  required
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Google Cloud Console ➔ IAM &amp; Admin ➔ Service Accounts ➔ Keys ➔ Create New Key (JSON).
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {status?.connected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect API</span>
                  </button>
                )}

                <div className="flex items-center space-x-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCredentials}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                  >
                    {savingCredentials ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying with Google...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Test &amp; Connect API</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function ActivityPulse({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
