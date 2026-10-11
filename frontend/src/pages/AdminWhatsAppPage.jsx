import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  QrCode, 
  Radio, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Power, 
  Info, 
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Bell,
  LogOut,
  Save,
  Check,
  PhoneCall,
  Calendar,
  MapPin,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { 
  getWhatsAppStatus, 
  connectWhatsApp, 
  refreshWhatsAppQR,
  getWhatsAppQR, 
  disconnectWhatsApp,
  logoutWhatsApp,
  getWhatsAppAdminSettings,
  updateWhatsAppAdminSettings,
  sendTestMessage 
} from '../api/client';

export default function AdminWhatsAppPage() {
  const [statusData, setStatusData] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshingQR, setRefreshingQR] = useState(false);

  // Admin New Booking WhatsApp Alert states
  const [adminAlertPhone, setAdminAlertPhone] = useState('');
  const [adminAlertEnabled, setAdminAlertEnabled] = useState(true);
  const [savingAlertSettings, setSavingAlertSettings] = useState(false);
  const [alertSettingsSuccess, setAlertSettingsSuccess] = useState('');
  const [alertSettingsError, setAlertSettingsError] = useState('');

  // Test message states
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('PB08 TAXI: Automated dispatch connectivity test. Everything is working!');
  const [testResult, setTestResult] = useState(null);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getWhatsAppStatus();
      setStatusData(data);
      if (data.connected) {
        // When connected, never display QR code
        setQrCode(null);
      } else if (data.qr_code) {
        setQrCode(data.qr_code);
      } else {
        // Attempt to fetch QR if available
        const qrRes = await getWhatsAppQR().catch(() => null);
        if (qrRes?.qr_code) {
          setQrCode(qrRes.qr_code);
        } else {
          setQrCode(null);
        }
      }
    } catch (err) {
      setStatusData({
        connected: false,
        status: 'gateway_offline',
        details: 'Unable to reach backend or OpenWA Gateway.',
        provider: 'OpenWA'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertSettings = async () => {
    try {
      const settings = await getWhatsAppAdminSettings();
      if (settings) {
        setAdminAlertPhone(settings.admin_alert_whatsapp_number || '');
        setAdminAlertEnabled(settings.admin_alert_whatsapp_enabled ?? true);
      }
    } catch (err) {
      console.error("Failed to load WhatsApp alert settings:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchAlertSettings();
  }, []);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await connectWhatsApp();
      if (res.qr_code) {
        setQrCode(res.qr_code);
      }
      await fetchStatus();
    } catch (err) {
      alert("Error starting WhatsApp session.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshQR = async () => {
    setRefreshingQR(true);
    try {
      const res = await refreshWhatsAppQR();
      if (res.qr_code) {
        setQrCode(res.qr_code);
      }
      await fetchStatus();
    } catch (err) {
      alert("Failed to refresh QR code. Please check connection.");
    } finally {
      setRefreshingQR(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to Log Out and unlink your WhatsApp account? You will need to scan the QR code again to reconnect.")) return;
    setActionLoading(true);
    try {
      await logoutWhatsApp();
      setQrCode(null);
      await fetchStatus();
    } catch (err) {
      alert("Error logging out of WhatsApp session.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAlertSettings = async (e) => {
    e.preventDefault();
    setSavingAlertSettings(true);
    setAlertSettingsSuccess('');
    setAlertSettingsError('');
    try {
      await updateWhatsAppAdminSettings({
        admin_alert_whatsapp_number: adminAlertPhone,
        admin_alert_whatsapp_enabled: adminAlertEnabled
      });
      setAlertSettingsSuccess('Admin booking alert settings updated successfully!');
      setTimeout(() => setAlertSettingsSuccess(''), 5000);
    } catch (err) {
      setAlertSettingsError('Failed to save alert settings. Please try again.');
    } finally {
      setSavingAlertSettings(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      alert("Please enter a destination phone number.");
      return;
    }

    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestMessage(testPhone.trim(), testMessage.trim());
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        message: "Network or server failure during test message dispatch.",
        error: err.response?.data?.detail || err.message
      });
    } finally {
      setSendingTest(false);
    }
  };

  const isConnected = statusData?.connected === true;

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">WhatsApp Integration</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Live multi-device companion integration powered by <strong>OpenWA Gateway</strong>.
            </p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading || actionLoading}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Status Card & Pairing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Live Status & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between pb-6 border-b border-zinc-850">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isConnected ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    <MessageSquare className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Gateway Connection Status</h2>
                    <p className="text-xs text-zinc-400">
                      Provider: <span className="font-semibold text-zinc-200">OpenWA API Gateway</span>
                    </p>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-zinc-900 text-amber-400 border border-zinc-800'
                }`}>
                  <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
                  <span className="uppercase">{statusData?.status || 'OFFLINE'}</span>
                </div>
              </div>

              {/* Status Details */}
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Session ID:</span>
                  <span className="text-zinc-300 font-mono font-bold">{statusData?.session_id || 'pb08-taxi'}</span>
                </div>
                {statusData?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Linked WhatsApp Phone:</span>
                    <span className="text-emerald-400 font-mono font-black">+{statusData.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Backend Info:</span>
                  <span className="text-zinc-300">{statusData?.details || 'Ready'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {!isConnected ? (
                  <>
                    <button
                      onClick={handleConnect}
                      disabled={actionLoading}
                      className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-6 py-3.5 rounded-xl text-xs shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                    >
                      <Smartphone className="w-4 h-4 stroke-[2.5]" />
                      <span>{actionLoading ? 'Connecting...' : 'Connect WhatsApp (Start Session)'}</span>
                    </button>
                    <button
                      onClick={handleRefreshQR}
                      disabled={refreshingQR || actionLoading}
                      className="bg-zinc-900 hover:bg-zinc-800 text-taxi-yellow font-extrabold px-5 py-3.5 rounded-xl text-xs border border-zinc-800 hover:border-taxi-yellow transition-all flex items-center space-x-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingQR ? 'animate-spin' : ''}`} />
                      <span>{refreshingQR ? 'Refreshing QR...' : 'Refresh QR'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    disabled={actionLoading}
                    className="bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-700 font-extrabold px-6 py-3.5 rounded-xl text-xs hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 shadow-lg shadow-red-950/40"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>{actionLoading ? 'Logging out...' : 'Log Out / Disconnect WhatsApp'}</span>
                  </button>
                )}

                <button
                  onClick={fetchStatus}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold px-5 py-3.5 rounded-xl text-xs border border-zinc-800 transition-colors"
                >
                  Check Live State
                </button>
              </div>

            </div>

            {/* Test Message Box */}
            <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3">
                <Send className="w-5 h-5 text-taxi-yellow" />
                <div>
                  <h3 className="text-base font-bold text-white">Send Test Message</h3>
                  <p className="text-xs text-zinc-400">
                    Verify that messages are transmitted and received on your phone.
                  </p>
                </div>
              </div>

              {!isConnected && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>WhatsApp is not connected yet. Please link your phone via QR code first before sending messages.</span>
                </div>
              )}

              {testResult && (
                <div className={`p-4 rounded-xl text-xs border flex items-start space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-red-950/60 border-red-800 text-red-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{testResult.message}</p>
                    {testResult.error && (
                      <p className="text-[11px] text-zinc-400 mt-1 font-mono">{testResult.error}</p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendTest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Recipient Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="e.g., 919876543210"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Message Content
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingTest || !isConnected}
                  className={`font-extrabold px-6 py-3 rounded-xl text-xs border transition-all flex items-center space-x-2 ${
                    !isConnected 
                      ? 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'
                      : 'bg-zinc-900 hover:bg-zinc-850 text-white border-zinc-700 hover:border-taxi-yellow'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-taxi-yellow" />
                  <span>{sendingTest ? 'Sending Test...' : 'Dispatch Test WhatsApp'}</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: QR Code Companion Display OR Connected Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {isConnected ? (
              /* Connected State: QR Code is completely hidden! */
              <div className="bg-zinc-950 border border-emerald-900/60 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-xl shadow-emerald-950/20">
                <div className="space-y-2">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-950 border-2 border-emerald-500/50 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
                    <ShieldCheck className="w-10 h-10 text-emerald-400 stroke-[2.2]" />
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2 inline-block"></span>
                      Ready & Online
                    </span>
                    <h3 className="text-xl font-black text-white mt-2">WhatsApp Connected</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Business dispatch device is linked successfully
                    </p>
                  </div>
                </div>

                {statusData?.phone && (
                  <div className="bg-zinc-900/80 border border-emerald-900/40 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Connected Device Phone</span>
                    <p className="text-lg font-black text-taxi-yellow font-mono">
                      +{statusData.phone}
                    </p>
                  </div>
                )}

                <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-4 text-left text-xs text-zinc-300 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Live Dispatch Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Customer booking confirmations and admin alerts will be sent automatically through this connected WhatsApp account.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    disabled={actionLoading}
                    className="w-full bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700 font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-950/30"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>{actionLoading ? 'Logging out...' : 'Log Out / Disconnect WhatsApp'}</span>
                  </button>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Clicking Log Out will unlink this phone from PB08 TAXI.
                  </p>
                </div>
              </div>
            ) : (
              /* Disconnected / Pairing State: Display QR Code & Refresh QR button */
              <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6 text-center">
                
                <div className="space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-taxi-yellow flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg font-black text-white">WhatsApp Web QR Pairing</h3>
                  <p className="text-xs text-zinc-400">
                    Scan to link your PB08 TAXI business phone number
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] relative">
                  {qrCode ? (
                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded-2xl shadow-xl inline-block">
                        {qrCode.startsWith('http') || qrCode.startsWith('data:image') ? (
                          <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 object-contain" />
                        ) : (
                          <div className="font-mono text-[9px] break-all max-w-[200px] text-black">
                            {qrCode}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-400 font-medium flex items-center justify-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                        <span>Scan with WhatsApp on your phone</span>
                      </p>

                      {/* Prominent Refresh QR Button inside QR card */}
                      <div>
                        <button
                          onClick={handleRefreshQR}
                          disabled={refreshingQR || actionLoading}
                          className="inline-flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-750 text-taxi-yellow border border-taxi-yellow/40 hover:border-taxi-yellow font-extrabold px-4 py-2 rounded-xl text-xs transition-transform hover:scale-105 active:scale-95"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${refreshingQR ? 'animate-spin' : ''}`} />
                          <span>{refreshingQR ? 'Refreshing...' : 'Refresh QR Code'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-6 text-zinc-500">
                      <Smartphone className="w-12 h-12 mx-auto text-zinc-600" />
                      <p className="text-xs">
                        No active QR code pending.<br />
                        Click <strong>Connect WhatsApp</strong> or <strong>Refresh QR</strong> to initialize session.
                      </p>
                      <button
                        onClick={handleRefreshQR}
                        disabled={refreshingQR || actionLoading}
                        className="inline-flex items-center space-x-2 bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-5 py-2.5 rounded-xl text-xs transition-transform hover:scale-105 active:scale-95"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshingQR ? 'animate-spin' : ''}`} />
                        <span>{refreshingQR ? 'Generating QR...' : 'Generate / Refresh QR'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="text-left bg-zinc-900/50 p-4 rounded-xl border border-zinc-850 text-xs text-zinc-400 space-y-2">
                  <p className="font-bold text-white text-xs">How to connect:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>Open <strong>WhatsApp</strong> on your taxi dispatch phone</li>
                    <li>Tap <strong>Settings / Menu (⋮)</strong> ➔ <strong>Linked Devices</strong></li>
                    <li>Tap <strong>Link a Device</strong></li>
                    <li>Point your phone camera at this QR code</li>
                  </ol>
                </div>

                <div className="pt-2">
                  <a
                    href="https://github.com/rmyndharis/OpenWA"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-zinc-500 hover:text-taxi-yellow transition-colors"
                  >
                    <span>OpenWA Documentation on GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* NEW SECTION: New Booking Alert Message (for admin) */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-850 gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center">
                <Bell className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white">New Booking Alert Message (for admin)</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-taxi-yellow/20 text-taxi-yellow border border-taxi-yellow/30">
                    Automated
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  The system will automatically send an instant WhatsApp notification to this mobile number whenever a new taxi booking is placed.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Settings */}
            <div className="lg:col-span-6 space-y-5">
              
              {alertSettingsSuccess && (
                <div className="p-4 rounded-xl text-xs bg-emerald-950/60 border border-emerald-800 text-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{alertSettingsSuccess}</span>
                </div>
              )}

              {alertSettingsError && (
                <div className="p-4 rounded-xl text-xs bg-red-950/60 border border-red-800 text-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{alertSettingsError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAlertSettings} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Admin Mobile Number (with Country Code)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={adminAlertPhone}
                      onChange={(e) => setAdminAlertPhone(e.target.value)}
                      placeholder="e.g. 919888079736 or 9888079736"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    Enter the phone number where admin will receive real-time WhatsApp booking alerts.
                  </p>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminAlertEnabled}
                      onChange={(e) => setAdminAlertEnabled(e.target.checked)}
                      className="w-4 h-4 text-taxi-yellow bg-zinc-950 border-zinc-700 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Enable Instant WhatsApp Alerts for New Bookings
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        When enabled, every new customer booking triggers an immediate WhatsApp message to this number.
                      </span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingAlertSettings}
                  className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-6 py-3.5 rounded-xl text-xs transition-transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-md shadow-taxi-yellow/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingAlertSettings ? 'Saving Settings...' : 'Save Alert Settings'}</span>
                </button>
              </form>

            </div>

            {/* Live Alert Message Preview */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  WhatsApp Alert Message Preview
                </span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Real-time format</span>
                </span>
              </div>

              {/* Simulated WhatsApp Chat Bubble */}
              <div className="bg-[#0b141a] border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <div className="text-[11px] text-zinc-400 mb-3 text-center">
                  <span className="bg-[#182229] px-2.5 py-1 rounded-md text-[10px] text-zinc-400">
                    TODAY
                  </span>
                </div>

                <div className="max-w-[90%] bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tl-sm text-xs space-y-2 shadow-md font-sans">
                  <p className="font-bold text-taxi-yellow text-[13px]">
                    🚖 PB08 TAXI — New Booking Alert!
                  </p>
                  <div className="border-b border-emerald-600/50 pb-1.5 text-[11px] space-y-1">
                    <p>📌 <strong>Booking Ref:</strong> #PB08-26-8942</p>
                    <p>👤 <strong>Customer Name:</strong> Rahul Sharma</p>
                    <p>📞 <strong>Contact Number:</strong> +91 98765 43210</p>
                    <p>📅 <strong>Pickup Date:</strong> 12-Oct-2026</p>
                    <p>⏰ <strong>Pickup Time:</strong> 10:30 AM</p>
                    <p>📍 <strong>Pickup:</strong> Amritsar Railway Station</p>
                    <p>🏁 <strong>Destination:</strong> Jalandhar City Center</p>
                    <p>🕒 <strong>Booked At (IST):</strong> 11-Oct-2026, 10:15 PM</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-emerald-200 italic">
                      👉 Please contact customer promptly to confirm the booking.
                    </p>
                    <div className="flex items-center space-x-1 text-[9px] text-emerald-300">
                      <span>09:30 PM</span>
                      <Check className="w-3 h-3 text-cyan-300 inline" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Destination:</span>
                  <span className="text-taxi-yellow font-mono font-bold">
                    {adminAlertPhone ? `+${adminAlertPhone}` : 'No alert number configured yet'}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
