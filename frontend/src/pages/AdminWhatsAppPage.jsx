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
  Smartphone
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { 
  getWhatsAppStatus, 
  connectWhatsApp, 
  getWhatsAppQR, 
  disconnectWhatsApp, 
  sendTestMessage 
} from '../api/client';

export default function AdminWhatsAppPage() {
  const [statusData, setStatusData] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
      if (data.qr_code) {
        setQrCode(data.qr_code);
      } else if (!data.connected) {
        // Attempt to fetch QR if available
        const qrRes = await getWhatsAppQR().catch(() => null);
        if (qrRes?.qr_code) setQrCode(qrRes.qr_code);
      } else {
        setQrCode(null);
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

  useEffect(() => {
    fetchStatus();
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

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect this WhatsApp session?")) return;
    setActionLoading(true);
    try {
      await disconnectWhatsApp();
      setQrCode(null);
      await fetchStatus();
    } catch (err) {
      alert("Error disconnecting WhatsApp session.");
    } finally {
      setActionLoading(false);
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
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Backend Info:</span>
                  <span className="text-zinc-300">{statusData?.details || 'Ready'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    disabled={actionLoading}
                    className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-6 py-3.5 rounded-xl text-xs shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <Smartphone className="w-4 h-4 stroke-[2.5]" />
                    <span>{actionLoading ? 'Connecting...' : 'Connect WhatsApp (Start Session)'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    disabled={actionLoading}
                    className="bg-red-950/60 hover:bg-red-950 text-red-300 border border-red-800 font-extrabold px-6 py-3.5 rounded-xl text-xs hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <Power className="w-4 h-4" />
                    <span>{actionLoading ? 'Disconnecting...' : 'Disconnect WhatsApp'}</span>
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
                  disabled={sendingTest}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white font-extrabold px-6 py-3 rounded-xl text-xs border border-zinc-700 hover:border-taxi-yellow transition-all flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5 text-taxi-yellow" />
                  <span>{sendingTest ? 'Sending Test...' : 'Dispatch Test WhatsApp'}</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: QR Code Companion Display */}
          <div className="lg:col-span-5 space-y-6">
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
                {isConnected ? (
                  <div className="space-y-3 py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">WhatsApp Account Linked</p>
                      <p className="text-xs text-emerald-400 font-medium">Session is ready and transmitting</p>
                    </div>
                  </div>
                ) : qrCode ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl shadow-lg inline-block">
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
                  </div>
                ) : (
                  <div className="space-y-3 py-6 text-zinc-500">
                    <Smartphone className="w-12 h-12 mx-auto text-zinc-600" />
                    <p className="text-xs">
                      No active QR code pending.<br />
                      Click <strong>Connect WhatsApp</strong> to initialize session.
                    </p>
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
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
