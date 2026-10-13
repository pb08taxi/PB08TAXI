import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Link2, 
  CheckCircle2, 
  Settings2, 
  HelpCircle, 
  Sparkles,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';
import { getLookerStudioConfig, saveLookerStudioConfig } from '../api/client';

export default function AdminLookerStudioViewer() {
  const [embedUrl, setEmbedUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [ga4Id, setGa4Id] = useState('G-MD0W9GNM7V');
  const [propertyId, setPropertyId] = useState('411659377');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [refreshKey, setRefreshKey] = useState(1);

  // Fetch Looker Studio configuration
  useEffect(() => {
    getLookerStudioConfig()
      .then((res) => {
        if (res) {
          if (res.embed_url) {
            setEmbedUrl(res.embed_url);
            setInputUrl(res.embed_url);
          }
          if (res.google_analytics_id) setGa4Id(res.google_analytics_id);
          if (res.ga4_property_id) setPropertyId(res.ga4_property_id);
        }
      })
      .catch((err) => console.warn('Could not load Looker Studio config:', err))
      .finally(() => setLoading(false));
  }, []);

  // Helper to sanitize Looker Studio URLs (extracts src if user pastes full iframe HTML)
  const sanitizeUrl = (raw) => {
    if (!raw) return '';
    let val = raw.trim();
    if (val.includes('<iframe') && val.includes('src=')) {
      const match = val.match(/src=["'](.*?)["']/);
      if (match && match[1]) val = match[1];
    }
    return val;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const clean = sanitizeUrl(inputUrl);
    setSaving(true);
    try {
      await saveLookerStudioConfig(clean);
      setEmbedUrl(clean);
      setSaveSuccess(true);
      setShowConfig(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert('Failed to save Looker Studio Embed URL');
    } finally {
      setSaving(false);
    }
  };

  const ga4RealtimeUrl = `https://analytics.google.com/analytics/web/#/p${propertyId}/reports/intelligenthome`;
  const lookerCreateUrl = `https://lookerstudio.google.com/reporting/create?c.datasource=GA4`;

  return (
    <div className={`space-y-6 ${isFullScreen ? 'fixed inset-0 z-50 bg-black p-4 sm:p-6 overflow-y-auto' : ''}`}>
      
      {/* Top Action Bar */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              Google Looker Studio 360
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center space-x-2">
            <span>A-to-Z Google Analytics Dashboard</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Linked to Google Analytics 4 Property: <span className="text-taxi-yellow font-mono font-bold">{ga4Id}</span> (ID #{propertyId})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
            title="Reload report frame"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              showConfig 
                ? 'bg-taxi-yellow text-black border-taxi-yellow' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Close Setup' : 'Configure Embed URL'}</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
            title="Toggle full screen"
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </>
            )}
          </button>

          <a
            href={ga4RealtimeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 px-3 py-2 rounded-xl text-xs font-bold border border-blue-800/80 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>GA4 Realtime</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Google Looker Studio Embed URL successfully saved and applied to your Admin Panel!</span>
        </div>
      )}

      {/* Configuration / Setup Guide Accordion */}
      {(showConfig || !embedUrl) && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-taxi-yellow" />
                <span>Google Looker Studio Embed Link Setup</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Google Analytics 4 ko 1-Click me Looker Studio me embed karke apna customized dashboard yahan lagayein.
              </p>
            </div>
            {embedUrl && (
              <button 
                onClick={() => setShowConfig(false)}
                className="text-xs font-bold text-zinc-500 hover:text-white"
              >
                Hide
              </button>
            )}
          </div>

          {/* Step by step cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1.5">
              <span className="font-extrabold text-taxi-yellow font-mono">STEP 1</span>
              <p className="font-bold text-white">Create Report in Looker Studio</p>
              <p className="text-zinc-400 text-[11px]">
                Niche diye gaye button par click karke Google Looker Studio me PB08 TAXI (G-MD0W9GNM7V) select karein.
              </p>
              <a 
                href={lookerCreateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-taxi-yellow font-bold text-[11px] hover:underline pt-1"
              >
                <span>Open Looker Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1.5">
              <span className="font-extrabold text-taxi-yellow font-mono">STEP 2</span>
              <p className="font-bold text-white">Get Embed URL</p>
              <p className="text-zinc-400 text-[11px]">
                Looker Studio me top menu me <strong className="text-zinc-200">File ➔ Embed report</strong> click karein, <strong className="text-zinc-200">Enable Embedding</strong> tick karein aur Embed URL copy karein.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1.5">
              <span className="font-extrabold text-taxi-yellow font-mono">STEP 3</span>
              <p className="font-bold text-white">Paste &amp; Save Below</p>
              <p className="text-zinc-400 text-[11px]">
                Copy kiya hua URL niche diye gaye input box me paste karke <strong className="text-zinc-200">"Save &amp; Embed"</strong> dabayein. Dashboard turant yahan load ho jayega!
              </p>
            </div>
          </div>

          {/* Form to paste URL */}
          <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste Looker Studio Embed URL (e.g. https://lookerstudio.google.com/embed/reporting/...)"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-taxi-yellow hover:bg-yellow-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Save & Embed'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Embedded Looker Studio Frame */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden relative shadow-2xl">
        {loading ? (
          <div className="h-[750px] flex items-center justify-center space-x-2 text-zinc-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-taxi-yellow" />
            <span>Loading Google Looker Studio Dashboard...</span>
          </div>
        ) : embedUrl ? (
          <div className="relative w-full" style={{ height: isFullScreen ? 'calc(100vh - 120px)' : '780px' }}>
            <iframe
              key={refreshKey}
              src={embedUrl}
              title="Google Looker Studio Analytics 360 for PB08 TAXI"
              className="w-full h-full border-0 rounded-2xl"
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        ) : (
          <div className="h-[480px] flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-inner">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-lg font-bold text-white">Google Looker Studio Report Not Embedded Yet</h3>
              <p className="text-xs text-zinc-400">
                Aapne abhi tak apna Looker Studio embed link paste nahi kiya hai. Apne Google Analytics <span className="text-taxi-yellow font-bold">({ga4Id})</span> ka complete A-to-Z dashboard dekhne ke liye upar diye gaye "Configure Embed URL" button se link save karein.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfig(true)}
                className="bg-taxi-yellow hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Configure Embed URL Now
              </button>
              <a
                href={lookerCreateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors inline-flex items-center space-x-1.5"
              >
                <span>Open Google Looker Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
