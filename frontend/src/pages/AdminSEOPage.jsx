import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Share2, 
  MapPin, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  Eye, 
  ExternalLink, 
  Sparkles,
  Smartphone,
  Laptop,
  Check,
  Copy,
  Info,
  Upload,
  Image as ImageIcon,
  Edit3,
  Loader2
} from 'lucide-react';
import { getAdminSEOSettings, updateAdminSEOSettings, resetAdminSEODefaults, uploadSEOBanner } from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';
import { useToast } from '../context/ToastContext';

export const DEFAULT_BANNER_URL = 'https://raw.githubusercontent.com/pb08taxi/PB08TAXI/main/Logo/pb08taxi-banner-default.png';

export default function AdminSEOPage() {
  const { showSuccess, showError } = useToast();

  const { data, loading, isRevalidating, refresh, mutate } = useAdminQuery(
    'admin_seo_settings',
    getAdminSEOSettings,
    { ttl: 3 * 60 * 1000 }
  );

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('google'); // 'google' | 'whatsapp'
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileInputRef = React.useRef(null);

  // Fallback image handler: tries jsDelivr CDN if raw.githubusercontent is blocked/slow, else official default banner
  const handleImageError = (e) => {
    if (e.target.dataset.triedJsdelivr !== 'true' && e.target.src && e.target.src.includes('raw.githubusercontent.com')) {
      e.target.dataset.triedJsdelivr = 'true';
      e.target.src = e.target.src.replace('https://raw.githubusercontent.com/', 'https://cdn.jsdelivr.net/gh/').replace('/main/', '@main/');
      return;
    }
    if (e.target.src !== DEFAULT_BANNER_URL) {
      e.target.src = DEFAULT_BANNER_URL;
    }
  };

  // Section A: Core Meta
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsDirective, setRobotsDirective] = useState('');

  // Section B: Social & OpenGraph
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState(DEFAULT_BANNER_URL);
  const [twitterCard, setTwitterCard] = useState('summary_large_image');

  // Section C: Local & Geo SEO
  const [businessName, setBusinessName] = useState('');
  const [geoRegion, setGeoRegion] = useState('');
  const [geoPlacename, setGeoPlacename] = useState('');
  const [geoLatitude, setGeoLatitude] = useState('');
  const [geoLongitude, setGeoLongitude] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');

  // Section D: Tracking & Custom Injections
  const [googleVerification, setGoogleVerification] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [schemaPriceRange, setSchemaPriceRange] = useState('₹₹');
  const [customHeadCode, setCustomHeadCode] = useState('');

  // Populate state when data loads
  useEffect(() => {
    if (data) {
      setMetaTitle(data.meta_title || '');
      setMetaDescription(data.meta_description || '');
      setMetaKeywords(data.meta_keywords || '');
      setCanonicalUrl(data.canonical_url || 'https://pb08taxi.com');
      setRobotsDirective(data.robots_directive || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

      setOgTitle(data.og_title || '');
      setOgDescription(data.og_description || '');
      
      // Auto-sanitize broken 1x1 placeholder to official default banner
      const validOgImage = (data.og_image && !data.og_image.includes('1791751050')) 
        ? data.og_image 
        : DEFAULT_BANNER_URL;
      setOgImage(validOgImage);
      setTwitterCard(data.twitter_card || 'summary_large_image');

      setBusinessName(data.business_name || 'PB08 TAXI');
      setGeoRegion(data.geo_region || 'IN-PB');
      setGeoPlacename(data.geo_placename || 'Jalandhar, Punjab, India');
      setGeoLatitude(data.geo_latitude || '31.3260');
      setGeoLongitude(data.geo_longitude || '75.5762');
      setServiceAreas(data.service_areas || '');

      setGoogleVerification(data.google_site_verification || '');
      setGoogleAnalyticsId(data.google_analytics_id || '');
      setMetaPixelId(data.meta_pixel_id || '');
      setSchemaPriceRange(data.schema_taxi_price_range || '₹₹');
      setCustomHeadCode(data.custom_head_code || '');
    }
  }, [data]);

  // Upload banner directly to GitHub /Logo folder with automatic git commit
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const res = await uploadSEOBanner(file);
      const newUrl = res.url || DEFAULT_BANNER_URL;
      setOgImage(newUrl);
      showSuccess(`Social Preview Banner uploaded to GitHub (${res.github_path || 'Logo/' + res.filename}) & updated!`, 'Banner Uploaded');
    } catch (err) {
      showError('Failed to upload banner: ' + (err.response?.data?.detail || 'Invalid image format'), 'Upload Error');
    } finally {
      setUploadingBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  // Reset banner to official high-resolution default PB08 TAXI banner
  const handleResetBannerDefault = () => {
    setOgImage(DEFAULT_BANNER_URL);
    showSuccess('Banner restored to official PB08 TAXI default!', 'Banner Reset');
  };

  // Jump to and focus the direct banner URL editor input
  const handleFocusBannerEdit = () => {
    const el = document.getElementById('seo-banner-url-input');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
      el.classList.add('ring-2', 'ring-taxi-yellow');
      setTimeout(() => el.classList.remove('ring-2', 'ring-taxi-yellow'), 2000);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        meta_keywords: metaKeywords.trim(),
        canonical_url: canonicalUrl.trim(),
        robots_directive: robotsDirective.trim(),
        og_title: ogTitle.trim(),
        og_description: ogDescription.trim(),
        og_image: ogImage.trim(),
        twitter_card: twitterCard.trim(),
        business_name: businessName.trim(),
        geo_region: geoRegion.trim(),
        geo_placename: geoPlacename.trim(),
        geo_latitude: geoLatitude.trim(),
        geo_longitude: geoLongitude.trim(),
        service_areas: serviceAreas.trim(),
        google_site_verification: googleVerification.trim() || null,
        google_analytics_id: googleAnalyticsId.trim() || null,
        meta_pixel_id: metaPixelId.trim() || null,
        schema_taxi_price_range: schemaPriceRange.trim() || '₹₹',
        custom_head_code: customHeadCode.trim() || null,
      };

      const res = await updateAdminSEOSettings(payload);
      mutate(res);
      adminCache.invalidate('admin_seo_settings');

      // Update instant local storage cache for zero-flicker public hydration
      try {
        localStorage.setItem('pb08_seo_settings_cache', JSON.stringify(res));
      } catch (err) {}

      showSuccess('Advance SEO settings updated and published successfully!', 'SEO Published');
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save SEO settings. Please try again.', 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Are you sure you want to restore official high-ranking PB08 TAXI default SEO settings? Any custom meta tags will be reset.")) return;
    setResetting(true);
    try {
      const res = await resetAdminSEODefaults();
      mutate(res);
      adminCache.invalidate('admin_seo_settings');
      try {
        localStorage.setItem('pb08_seo_settings_cache', JSON.stringify(res));
      } catch (err) {}
      showSuccess('All SEO settings restored to high-ranking PB08 TAXI defaults!', 'SEO Reset');
    } catch (err) {
      showError('Failed to reset SEO settings.', 'Reset Error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-white">Advance SEO & Omnichannel Injections</h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete A-to-Z control over Google Search Ranking, WhatsApp & Facebook link cards, Punjab Local SEO, and Meta Tracking Pixels.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => refresh()}
            disabled={loading || isRevalidating}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Updating...' : 'Reload'}</span>
          </button>

          <button
            onClick={handleResetDefaults}
            disabled={resetting || saving}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-800 hover:border-red-800 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Live SERP & Social Sharing Card Simulator */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
              <Eye className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Search & Social Preview Simulator</h2>
              <p className="text-xs text-zinc-400">
                Real-time visual preview of how your website appears on Google and when shared on WhatsApp/Facebook.
              </p>
            </div>
          </div>

          <div className="inline-flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setActivePreviewTab('google')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePreviewTab === 'google'
                  ? 'bg-taxi-yellow text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google SERP Preview</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('whatsapp')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePreviewTab === 'whatsapp'
                  ? 'bg-[#25D366] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp / Social Card Preview</span>
            </button>
          </div>
        </div>

        {activePreviewTab === 'google' ? (
          /* Google SERP Snippet Preview */
          <div className="bg-[#202124] p-5 sm:p-6 rounded-2xl border border-zinc-700 max-w-2xl font-sans text-left space-y-1.5 shadow-xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-taxi-yellow text-xs font-black">
                🚖
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-zinc-200 font-medium leading-none">{businessName || 'PB08 TAXI'}</span>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5">{canonicalUrl || 'https://pb08taxi.com'}</span>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug line-clamp-2 pt-1">
              {metaTitle || 'PB08 TAXI — One Click Book Your Ride | 24/7 Cab Service'}
            </h3>
            <p className="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed line-clamp-3">
              {metaDescription || 'PB08 TAXI provides fast, reliable, 24/7 taxi booking in Jalandhar, Punjab, and airport transfers. One click instant booking with live WhatsApp confirmation.'}
            </p>
            <div className="flex items-center space-x-3 pt-2 text-[11px] text-zinc-400 font-mono">
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">★ 4.9 (500+ Reviews)</span>
              <span>• Service: 24/7 Taxi</span>
              <span>• Area: {geoPlacename || 'Jalandhar, Punjab'}</span>
            </div>
          </div>
        ) : (
          /* WhatsApp / Facebook Social Card Simulator */
          <div className="space-y-4 max-w-xl">
            {/* Quick Action Toolbar directly inside preview */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
                <span className="text-xs font-bold text-white">Social Banner Actions:</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="inline-flex items-center space-x-1.5 bg-taxi-yellow hover:bg-taxi-yellowHover text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  {uploadingBanner ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Banner</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleFocusBannerEdit}
                  className="inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-taxi-yellow" />
                  <span>Edit URL</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetBannerDefault}
                  title="Reset to default PB08 TAXI banner"
                  className="inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Back to Default</span>
                </button>
              </div>
            </div>

            {/* Simulated WhatsApp / Facebook Share Message Bubble */}
            <div className="bg-[#0b141a] p-4 sm:p-5 rounded-2xl border border-zinc-800 shadow-2xl">
              <div className="bg-[#1f2c34] rounded-2xl overflow-hidden border border-[#2a3942] text-left">
                <div className="h-48 sm:h-52 w-full bg-zinc-950 overflow-hidden relative group">
                  <img 
                    src={ogImage || DEFAULT_BANNER_URL} 
                    alt="PB08 TAXI Social Preview Banner" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" 
                    onError={handleImageError}
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-1.5">
                    <span className="bg-black/75 backdrop-blur-sm text-taxi-yellow text-[10px] font-bold px-2 py-0.5 rounded-md border border-zinc-700/80">
                      Auto-Injected Card
                    </span>
                    <span className="bg-[#25D366]/90 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                      1200×630 HD
                    </span>
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
                    {new URL(canonicalUrl || 'https://pb08taxi.com').hostname}
                  </p>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                    {ogTitle || metaTitle || 'PB08 TAXI — 24/7 Cab Service in Punjab'}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {ogDescription || metaDescription || 'Reliable & affordable cabs in Jalandhar, Amritsar, Ludhiana, Chandigarh & Delhi Airport.'}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-400 mt-2.5 font-medium flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Automatically displays when shared on WhatsApp, Facebook, Instagram Bio, or Twitter.</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Core Search Engine Metadata */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
            <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">1. Core Search Engine Metadata</h2>
              <p className="text-xs text-zinc-400">
                Primary tags crawled by Googlebot, Bingbot, and DuckDuckGo to understand your pages.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Google Meta Title Tag <span className="text-taxi-yellow">*</span>
                </label>
                <span className={`text-[11px] font-mono ${metaTitle.length > 60 ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}>
                  {metaTitle.length}/60 characters {metaTitle.length > 60 ? '(Google may truncate)' : ''}
                </span>
              </div>
              <input
                type="text"
                required
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="PB08 TAXI — One Click Book Your Ride | 24/7 Cab Service"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-medium"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                The clickable headline link shown on Google search results pages.
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Google Meta Description Snippet <span className="text-taxi-yellow">*</span>
                </label>
                <span className={`text-[11px] font-mono ${metaDescription.length > 160 ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}>
                  {metaDescription.length}/160 characters {metaDescription.length > 160 ? '(Optimal: 150-160)' : ''}
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="PB08 TAXI provides fast, reliable, 24/7 taxi booking in Jalandhar, Punjab, and airport transfers. One click instant booking with live WhatsApp confirmation."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none leading-relaxed"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                The summary snippet shown below the title in Google search results. Include your main keywords and calling phone.
              </p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Target Search Keywords (Comma-Separated)
              </label>
              <textarea
                rows={2}
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="PB08 TAXI, Jalandhar Taxi, Punjab Cab Service, Airport Taxi, Outstation Cab, Amritsar Airport Cab, Delhi Airport Transfer"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {metaKeywords.split(',').filter(k => k.trim()).slice(0, 8).map((k, i) => (
                  <span key={i} className="text-[10px] bg-zinc-900 text-taxi-yellow border border-zinc-800 px-2 py-0.5 rounded-md font-mono">
                    #{k.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Canonical URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Canonical Website URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://pb08taxi.com"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Prevents duplicate content penalties by declaring your authoritative homepage URL.
                </p>
              </div>

              {/* Robots Directive */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Robots Indexing Directive
                </label>
                <select
                  value={robotsDirective.includes('noindex') ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
                  onChange={(e) => setRobotsDirective(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white outline-none"
                >
                  <option value="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
                    ✅ index, follow (Recommended — Full Google Indexing & Snippets)
                  </option>
                  <option value="noindex, nofollow">
                    ⛔ noindex, nofollow (Hide whole site from search engines)
                  </option>
                </select>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Instructions for Googlebot crawling permissions.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Social Media & WhatsApp Link Sharing (OpenGraph) */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
            <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. WhatsApp, Facebook & Instagram Rich Previews (OpenGraph)</h2>
              <p className="text-xs text-zinc-400">
                Controls the large banner card, title, and summary displayed when your website link is posted or messaged.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* OG Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Social Card Title (og:title)
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="PB08 TAXI — 24/7 Cab Service in Punjab | One Click Booking"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* Twitter Card Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Twitter Card Format
                </label>
                <select
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white outline-none"
                >
                  <option value="summary_large_image">summary_large_image (Large prominent banner)</option>
                  <option value="summary">summary (Compact thumbnail)</option>
                </select>
              </div>

            </div>

            {/* OG Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Social Card Summary (og:description)
              </label>
              <textarea
                rows={2}
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                placeholder="Reliable & affordable cabs in Jalandhar, Amritsar, Ludhiana, Chandigarh & Delhi Airport. One-click reservation with instant WhatsApp confirmation."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none leading-relaxed"
              />
            </div>

            {/* OG Image Banner Management Card */}
            <div className="bg-zinc-900/40 p-5 sm:p-6 rounded-2xl border border-zinc-850 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-taxi-yellow" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Social Sharing Banner Image (og:image / WhatsApp & Social Card)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetBannerDefault}
                  className="text-xs text-zinc-400 hover:text-taxi-yellow flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Back to Default Banner</span>
                </button>
              </div>

              {/* Recommended specifications */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <p className="font-bold text-taxi-yellow">Recommended Specifications for WhatsApp & Social Cards:</p>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                  <li><strong>Dimensions:</strong> 1200 × 630 pixels (Standard 1.91:1 OpenGraph ratio)</li>
                  <li><strong>Formats:</strong> PNG, JPG, or WebP (High Resolution)</li>
                  <li><strong>Where it appears:</strong> WhatsApp chat preview bubbles, Facebook feed cards, Instagram bio previews, and Twitter summary cards</li>
                </ul>
              </div>

              {/* Live Banner Preview Box */}
              <div className="aspect-[1.91/1] max-h-64 w-full bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center group shadow-inner">
                <img 
                  src={ogImage || DEFAULT_BANNER_URL} 
                  alt="Social Sharing Banner" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  onError={handleImageError}
                />
                <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-2">
                  <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-zinc-700">
                    Live Banner Preview
                  </span>
                  {ogImage === DEFAULT_BANNER_URL && (
                    <span className="bg-taxi-yellow text-black text-[10px] font-black px-2 py-0.5 rounded-md">
                      Official Default
                    </span>
                  )}
                </div>
              </div>

              {/* Upload to GitHub Button & URL Edit */}
              <div className="space-y-3 pt-1">
                <label className="cursor-pointer block bg-zinc-900 hover:bg-zinc-850 border border-dashed border-zinc-700 hover:border-taxi-yellow rounded-xl p-3.5 text-center transition-all group">
                  <span className="text-xs text-zinc-300 flex items-center justify-center space-x-2">
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 text-taxi-yellow animate-spin" />
                        <span className="text-white font-bold">Uploading Banner to GitHub /Logo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-taxi-yellow group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Upload New Banner (Auto-saves to GitHub /Logo & sets URL)</span>
                      </>
                    )}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="hidden"
                  />
                </label>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Direct Banner URL (Edit or Paste Custom Link)
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {ogImage ? `${ogImage.slice(0, 45)}...` : 'Using Default'}
                    </span>
                  </div>
                  <input
                    id="seo-banner-url-input"
                    type="url"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder={DEFAULT_BANNER_URL}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 outline-none font-mono transition-all"
                  />
                  <p className="text-[10px] text-zinc-500 pl-1">
                    Upload auto-renames to <span className="font-mono text-zinc-400">pb08taxi-banner-[ts].ext</span> and commits directly to GitHub <span className="font-mono text-taxi-yellow font-bold">Logo/</span> folder, or you can paste any custom image URL.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Punjab Local SEO & Geographic Targeting */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
            <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">3. Punjab Local SEO & Geographic Targeting</h2>
              <p className="text-xs text-zinc-400">
                Helps Google rank your website at the very top for customers searching in Jalandhar and Punjab.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Business Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Business Name (For Maps & Schema)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="PB08 TAXI"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-bold"
                />
              </div>

              {/* Geo Region */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Geo Region Code
                </label>
                <input
                  type="text"
                  value={geoRegion}
                  onChange={(e) => setGeoRegion(e.target.value)}
                  placeholder="IN-PB"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">ISO code for Punjab, India (<strong className="text-zinc-300">IN-PB</strong>)</p>
              </div>

              {/* City Placename */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Primary Operating City
                </label>
                <input
                  type="text"
                  value={geoPlacename}
                  onChange={(e) => setGeoPlacename(e.target.value)}
                  placeholder="Jalandhar, Punjab, India"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Latitude */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Geo Latitude
                </label>
                <input
                  type="text"
                  value={geoLatitude}
                  onChange={(e) => setGeoLatitude(e.target.value)}
                  placeholder="31.3260"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Geo Longitude
                </label>
                <input
                  type="text"
                  value={geoLongitude}
                  onChange={(e) => setGeoLongitude(e.target.value)}
                  placeholder="75.5762"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
              </div>

              {/* Schema Price Range */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Price Range Indicator
                </label>
                <input
                  type="text"
                  value={schemaPriceRange}
                  onChange={(e) => setSchemaPriceRange(e.target.value)}
                  placeholder="₹₹"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-bold"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Appears in Google Rich Snippets (<strong className="text-zinc-300">₹₹</strong> / Affordable)</p>
              </div>

            </div>

            {/* Service Areas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Target Service Areas & Airport Routes
              </label>
              <textarea
                rows={2}
                value={serviceAreas}
                onChange={(e) => setServiceAreas(e.target.value)}
                placeholder="Jalandhar, Amritsar, Ludhiana, Chandigarh, Delhi Airport (DEL), Amritsar Airport (ATQ), Phagwara, Kapurthala, Hoshiarpur, Punjab"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Injected into Google's <code className="text-taxi-yellow font-mono">Schema.org areaServed</code> structured data array for local taxi discovery.
              </p>
            </div>

          </div>
        </div>

        {/* Section 4: Search Engine Verification & Tracking Pixels */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
            <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
              <Code className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">4. Verification Codes & Tracking Pixels</h2>
              <p className="text-xs text-zinc-400">
                Connect Google Search Console, Google Analytics 4, and Meta (Facebook & Instagram) Pixel for automatic conversion tracking.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Google Search Console */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Google Search Console Verification Tag
                </label>
                <input
                  type="text"
                  value={googleVerification}
                  onChange={(e) => setGoogleVerification(e.target.value)}
                  placeholder="e.g. abcdefghijklmnopqrstuvwxyz123456"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Value from Google Search Console HTML tag method.
                </p>
              </div>

              {/* Google Analytics 4 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Real-time visitor and booking analytics.
                </p>
              </div>

              {/* Meta Pixel ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Meta (Facebook/Instagram) Pixel ID
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Tracks ad conversions from Instagram and Facebook local campaigns.
                </p>
              </div>

            </div>

            {/* Custom Head Injection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Custom HTML &lt;head&gt; Code Injection (Optional)
              </label>
              <textarea
                rows={3}
                value={customHeadCode}
                onChange={(e) => setCustomHeadCode(e.target.value)}
                placeholder="<!-- Paste any additional custom meta tags, scripts, or verification snippets here -->"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Advanced: Any code entered here will be injected safely into the site's <code className="text-zinc-400 font-mono">&lt;head&gt;</code> element.
              </p>
            </div>

          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-6 z-20 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5 text-xs text-zinc-400">
            <Sparkles className="w-4 h-4 text-taxi-yellow" />
            <span>Changes apply immediately across all search engines and social link previews with zero refresh flicker.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-taxi-yellow hover:bg-taxi-yellowHover disabled:opacity-60 text-black font-black text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing SEO Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save & Publish All SEO Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
