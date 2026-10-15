import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Phone, 
  MessageSquare, 
  Image as ImageIcon, 
  Upload, 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertTriangle,
  KeyRound,
  X,
  Car,
  Type,
  Sparkles,
  Check,
  Sliders,
  Share2,
  Globe
} from 'lucide-react';
import { 
  getAdminSettings, 
  updateAdminSettings, 
  uploadSiteAsset, 
  updateAdminCredentials,
  factoryResetSystem
} from '../api/client';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../context/ToastContext';
import { useAdminQuery, adminCache } from '../utils/adminCache';

export const MODAL_ANIMATION_OPTIONS = [
  {
    id: 'golden-glow',
    name: 'Golden Aura Glow (Default)',
    tag: 'Recommended',
    description: 'Pulsing warm golden halo radiating outside the modal perimeter. Rich, elegant, and matches PB08 TAXI yellow theme.',
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon Flow',
    tag: 'High Energy',
    description: 'Circulating vibrant neon border stream with rotating angular light. Modern futuristic vibe.',
  },
  {
    id: 'ambient-breath',
    name: 'Ambient Deep Breath',
    tag: 'Luxury',
    description: 'Soft, deep breathing backdrop aura with expanded blur. Smooth luxury vehicle ambient lighting effect.',
  },
  {
    id: 'radar-ripple',
    name: 'Radar Pulse Waves',
    tag: 'Dynamic',
    description: 'Concentric animated ripple waves expanding smoothly into the backdrop behind the form.',
  },
  {
    id: 'aurora-shimmer',
    name: 'Aurora Amber & Gold',
    tag: 'Shimmering',
    description: 'Multi-toned golden & amber gradient aurora shimmer sweeping gracefully outside the card.',
  },
  {
    id: 'none',
    name: 'Static Clean (No Motion)',
    tag: 'Minimalist',
    description: 'Zero outer animation. Crisp, stationary dark container with sleek subtle border and shadow.',
  }
];

export default function AdminSettingsPage() {
  const { refreshSettings: refreshGlobalSettings, updateLocalSettings } = useSiteSettings();
  const { showSuccess, showError } = useToast();

  const { data, loading, isRevalidating, refresh, mutate } = useAdminQuery(
    'admin_site_settings',
    getAdminSettings,
    { ttl: 3 * 60 * 1000 }
  );

  const [savingSettings, setSavingSettings] = useState(false);

  // Contact & Brand settings
  const [supportPhone, setSupportPhone] = useState('+919876543210');
  const [whatsappNumber, setWhatsappNumber] = useState('+919876543210');
  const [siteLogoUrl, setSiteLogoUrl] = useState('');
  const [siteFaviconUrl, setSiteFaviconUrl] = useState('');
  const [siteLogoSize, setSiteLogoSize] = useState(48);
  const [brandTitle, setBrandTitle] = useState('PB08 TAXI');
  const [brandTagline, setBrandTagline] = useState('Fast • Safe • Reliable');
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);
  const [bookingModalAnimation, setBookingModalAnimation] = useState('golden-glow');

  // Social Media Links
  const [socialFacebook, setSocialFacebook] = useState('https://facebook.com/pb08taxi');
  const [socialInstagram, setSocialInstagram] = useState('https://instagram.com/pb08taxi');
  const [socialTwitter, setSocialTwitter] = useState('https://twitter.com/pb08taxi');
  const [socialYoutube, setSocialYoutube] = useState('https://youtube.com/@pb08taxi');

  // Upload loaders
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Admin Credentials change states
  const [currentUsername, setCurrentUsername] = useState('admin');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password eye visibility toggles
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [savingCreds, setSavingCreds] = useState(false);

  // Factory Reset states (Secret PIN: 333725)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  // Sync settings when data changes
  useEffect(() => {
    if (data) {
      setSupportPhone(data.support_phone || '+919876543210');
      setWhatsappNumber(data.whatsapp_number || '+919876543210');
      setSiteLogoUrl(data.site_logo_url || '');
      setSiteFaviconUrl(data.site_favicon_url || '');
      setSiteLogoSize(data.site_logo_size || 48);
      setBrandTitle(data.brand_title || 'PB08 TAXI');
      setBrandTagline(data.brand_tagline || 'Fast • Safe • Reliable');
      setShowCredentialsHint(data.show_credentials_hint ?? false);
      setBookingModalAnimation(data.booking_modal_animation || 'golden-glow');
      setSocialFacebook(data.social_facebook || '');
      setSocialInstagram(data.social_instagram || '');
      setSocialTwitter(data.social_twitter || '');
      setSocialYoutube(data.social_youtube || '');
      setCurrentUsername(data.admin_username || 'admin');
    }
  }, [data]);

  // Handle saving general site settings (phone, whatsapp, logo, favicon, brand text, hint, animation)
  const handleSaveSiteSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const formatPhone = (val) => {
        if (!val) return val;
        const digits = val.replace(/\D/g, '');
        if (digits.length === 10) return `+91${digits}`;
        if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
        return `+${digits}`;
      };

      const cleanSupport = formatPhone(supportPhone);
      const cleanWa = formatPhone(whatsappNumber);

      const payload = {
        support_phone: cleanSupport,
        whatsapp_number: cleanWa,
        site_logo_url: siteLogoUrl,
        site_favicon_url: siteFaviconUrl,
        site_logo_size: Number(siteLogoSize) || 48,
        brand_title: brandTitle.trim() || 'PB08 TAXI',
        brand_tagline: brandTagline.trim() || 'Fast • Safe • Reliable',
        show_credentials_hint: showCredentialsHint,
        booking_modal_animation: bookingModalAnimation,
        social_facebook: socialFacebook.trim(),
        social_instagram: socialInstagram.trim(),
        social_twitter: socialTwitter.trim(),
        social_youtube: socialYoutube.trim()
      };
      await updateAdminSettings(payload);
      mutate((prev) => ({ ...prev, ...payload }));
      if (updateLocalSettings) updateLocalSettings(payload);
      if (refreshGlobalSettings) await refreshGlobalSettings();
      showSuccess('Site settings updated and published successfully!', 'Settings Saved');
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update site settings.', 'Save Failed');
    } finally {
      setSavingSettings(false);
    }
  };

  // Upload Logo to GitHub /Logo folder with auto-renaming
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await uploadSiteAsset(file, 'logo');
      setSiteLogoUrl(res.url); // Automatically populate URL below!
      if (updateLocalSettings) updateLocalSettings({ site_logo_url: res.url });
      if (refreshGlobalSettings) await refreshGlobalSettings();
      showSuccess(`Site Logo uploaded to GitHub (${res.github_path || 'Logo/' + res.filename}) & direct URL updated!`, 'Logo Uploaded');
    } catch (err) {
      showError("Failed to upload logo: " + (err.response?.data?.detail || "Invalid format"), 'Upload Error');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Upload Favicon to GitHub /Logo folder with auto-renaming
  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const res = await uploadSiteAsset(file, 'favicon');
      setSiteFaviconUrl(res.url); // Automatically populate URL below!
      if (updateLocalSettings) updateLocalSettings({ site_favicon_url: res.url });
      if (refreshGlobalSettings) await refreshGlobalSettings();
      showSuccess(`Favicon uploaded to GitHub (${res.github_path || 'Logo/' + res.filename}) & direct URL updated!`, 'Favicon Uploaded');
    } catch (err) {
      showError("Failed to upload favicon: " + (err.response?.data?.detail || "Invalid format"), 'Upload Error');
    } finally {
      setUploadingFavicon(false);
      e.target.value = '';
    }
  };

  // Handle changing Admin credentials
  const handleChangeCredentials = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showError("Please enter your current password to authorize this change.", "Validation Error");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showError("New password and confirm password do not match.", "Validation Error");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showError("New password must be at least 6 characters long.", "Validation Error");
      return;
    }

    setSavingCreds(true);
    try {
      const res = await updateAdminCredentials({
        current_password: currentPassword,
        new_username: newUsername.trim() || undefined,
        new_password: newPassword.trim() || undefined
      });

      if (res.access_token) {
        localStorage.setItem('pb08_admin_token', res.access_token);
      }
      if (res.username) {
        localStorage.setItem('pb08_admin_user', res.username);
        setCurrentUsername(res.username);
      }

      showSuccess("Admin credentials updated successfully!", "Credentials Updated");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewUsername('');
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update credentials.', 'Update Error');
    } finally {
      setSavingCreds(false);
    }
  };

  // Handle Factory Reset (Secret PIN: 333725)
  const handleFactoryReset = async (e) => {
    if (e) e.preventDefault();
    if (resetPin.trim() !== "333725") {
      setResetError("Incorrect Secret PIN! Please enter 333725 to confirm.");
      showError("Incorrect Secret PIN! Please enter 333725 to confirm.", "PIN Verification Failed");
      return;
    }
    setResetting(true);
    setResetError("");
    setResetSuccess("");
    try {
      const res = await factoryResetSystem(resetPin.trim());
      setResetSuccess(res.message || "Website Factory Reset Completed Successfully!");
      showSuccess(res.message || "Website Factory Reset Completed Successfully!", "Factory Reset Done");
      adminCache.invalidate();
      if (refreshGlobalSettings) refreshGlobalSettings();
      setTimeout(async () => {
        setShowResetModal(false);
        setResetPin("");
        setResetSuccess("");
        await refresh();
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Failed to perform factory reset. Please try again.";
      setResetError(errMsg);
      showError(errMsg, "Reset Error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <div className="space-y-8 max-w-5xl">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Site & Security Settings</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Configure public phone numbers, floating WhatsApp support, custom branding, and administrator security.
            </p>
          </div>
          <button
            onClick={() => refresh()}
            disabled={loading || isRevalidating}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Updating...' : 'Reload'}</span>
          </button>
        </div>

        {/* Form 1: Contact Numbers & WhatsApp Integration */}
        <form onSubmit={handleSaveSiteSettings} className="space-y-8">
          
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
                <Phone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Public Contact Numbers</h2>
                <p className="text-xs text-zinc-400">
                  Update customer calling helpline and floating WhatsApp chat destination.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Helpline Calling Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Helpline / Calling Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                  Appears on Navbar call button, Hero "Call 24/7" button, Contact cards, and Footer.
                </p>
              </div>

              {/* Floating WhatsApp Button Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Floating WhatsApp Button Number
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-[#25D366] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#25D366] rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                  Destination for the floating bottom-right <strong className="text-[#25D366]">"Chat with PB08 TAXI Support"</strong> WhatsApp button.
                </p>
              </div>

              {/* Quick Link to WhatsApp Admin Booking Alerts */}
              <div className="md:col-span-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Automated Admin Booking WhatsApp Alerts</p>
                    <p className="text-[11px] text-zinc-400">Configure admin mobile number to receive instant WhatsApp alerts with full customer and trip details.</p>
                  </div>
                </div>
                <a
                  href="/admin/whatsapp"
                  className="inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-750 text-taxi-yellow px-4 py-2 rounded-xl text-xs font-bold transition-all border border-zinc-700 self-start sm:self-auto hover:border-taxi-yellow"
                >
                  <span>WhatsApp Settings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>

          {/* Form 2: Brand Assets (Site Logo, Favicon & Brand Texts) */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Site Branding (Logo, Favicon & Brand Texts)</h2>
                <p className="text-xs text-zinc-400">
                  Customize your brand logo, browser favicon, brand title text, and tagline shown across Navbar and Footer.
                </p>
              </div>
            </div>

            {/* Brand Title and Tagline Customization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/50 p-5 rounded-2xl border border-zinc-850">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center space-x-1.5">
                  <Type className="w-3.5 h-3.5 text-taxi-yellow" />
                  <span>Brand Name Text (Logo Beside Text)</span>
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-taxi-yellow absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={brandTitle}
                    onChange={(e) => setBrandTitle(e.target.value)}
                    placeholder="PB08 TAXI"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-bold"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                  Appears beside your logo in Navbar, Footer, and Admin header (Default: <strong className="text-white">PB08 TAXI</strong>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center space-x-1.5">
                  <Type className="w-3.5 h-3.5 text-taxi-yellow" />
                  <span>Brand Tagline / Slogan Subtitle</span>
                </label>
                <div className="relative">
                  <Type className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    placeholder="Fast • Safe • Reliable"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-medium"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                  Catchy subtitle shown underneath the brand name (Default: <strong className="text-white">Fast • Safe • Reliable</strong>).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Site Logo Section */}
              <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
                    <span>Site Logo</span>
                  </span>
                  {siteLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setSiteLogoUrl('')}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Reset to Default</span>
                    </button>
                  )}
                </div>

                {/* Recommended specifications */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-bold text-taxi-yellow">Recommended Specifications:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                    <li><strong>Pixel Size:</strong> 512 × 512 px (Square) or 500 × 120 px (Horizontal)</li>
                    <li><strong>Format:</strong> PNG / SVG with transparent background, or WebP</li>
                    <li><strong>Max File Size:</strong> 2 MB</li>
                  </ul>
                </div>

                {/* Logo Size Control Slide Bar */}
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-taxi-yellow" />
                      <span>Logo Display Size</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-taxi-yellow font-mono font-bold text-xs">
                        {siteLogoSize} px
                      </span>
                      {siteLogoSize !== 48 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSiteLogoSize(48);
                            if (updateLocalSettings) updateLocalSettings({ site_logo_size: 48 });
                          }}
                          className="text-[10px] text-zinc-400 hover:text-taxi-yellow underline decoration-dotted"
                          title="Reset to 48px standard"
                        >
                          Default
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="24"
                      max="120"
                      step="2"
                      value={siteLogoSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSiteLogoSize(val);
                        if (updateLocalSettings) updateLocalSettings({ site_logo_size: val });
                      }}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-taxi-yellow"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>24px (Small)</span>
                      <span>48px (Standard)</span>
                      <span>120px (Large)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { label: '36px', size: 36, desc: 'Compact' },
                      { label: '48px', size: 48, desc: 'Default' },
                      { label: '64px', size: 64, desc: 'Medium' },
                      { label: '80px', size: 80, desc: 'Large' },
                      { label: '100px', size: 100, desc: 'X-Large' },
                    ].map((preset) => (
                      <button
                        key={preset.size}
                        type="button"
                        onClick={() => {
                          setSiteLogoSize(preset.size);
                          if (updateLocalSettings) updateLocalSettings({ site_logo_size: preset.size });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          siteLogoSize === preset.size
                            ? 'bg-taxi-yellow text-black border-taxi-yellow shadow-sm font-black'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {preset.label} <span className="font-normal opacity-75">({preset.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Live Preview Area */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-bold text-zinc-300">Live Logo Preview:</span>
                    <span className="font-mono text-taxi-yellow text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      Height: {siteLogoSize}px
                    </span>
                  </div>

                  {/* Standalone Logo Preview Box */}
                  <div className="min-h-[130px] bg-zinc-900/50 border border-zinc-850 rounded-xl flex items-center justify-center p-4 relative overflow-hidden transition-all">
                    {siteLogoUrl ? (
                      <img
                        src={siteLogoUrl}
                        alt="Logo Preview"
                        style={{ height: `${siteLogoSize}px`, width: 'auto' }}
                        className="max-w-full object-contain rounded-xl p-1 bg-zinc-900/90 border border-zinc-800 transition-all duration-150"
                      />
                    ) : (
                      <div
                        style={{ width: `${siteLogoSize}px`, height: `${siteLogoSize}px` }}
                        className="rounded-xl bg-taxi-yellow flex items-center justify-center text-black shadow-lg shadow-taxi-yellow/20 flex-shrink-0 transition-all duration-150"
                      >
                        <Car
                          style={{
                            width: `${Math.max(14, Math.round(siteLogoSize * 0.55))}px`,
                            height: `${Math.max(14, Math.round(siteLogoSize * 0.55))}px`
                          }}
                          className="text-black stroke-[2.5]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Live Header Simulation Preview (Shows text stable & only logo sized) */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                      Header Preview (Beside Brand Title)
                    </span>
                    <div className="bg-black/80 border border-zinc-850 rounded-xl p-3 flex items-center space-x-3 overflow-hidden">
                      {siteLogoUrl ? (
                        <img
                          src={siteLogoUrl}
                          alt={brandTitle}
                          style={{ height: `${siteLogoSize}px`, width: 'auto' }}
                          className="max-w-[140px] object-contain rounded-lg p-0.5 bg-zinc-900/80 border border-zinc-800 transition-all duration-150 flex-shrink-0"
                        />
                      ) : (
                        <div
                          style={{ width: `${siteLogoSize}px`, height: `${siteLogoSize}px` }}
                          className="rounded-lg bg-taxi-yellow flex items-center justify-center text-black shadow-md flex-shrink-0 transition-all duration-150"
                        >
                          <Car
                            style={{
                              width: `${Math.max(14, Math.round(siteLogoSize * 0.55))}px`,
                              height: `${Math.max(14, Math.round(siteLogoSize * 0.55))}px`
                            }}
                            className="text-black stroke-[2.5]"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base font-black text-white truncate block leading-tight">
                          {brandTitle || 'PB08 TAXI'}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold truncate block mt-0.5">
                          {brandTagline || 'Fast • Safe • Reliable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload or URL */}
                <div className="space-y-2">
                  <label className="cursor-pointer block bg-zinc-900 hover:bg-zinc-850 border border-dashed border-zinc-700 hover:border-taxi-yellow rounded-xl p-3 text-center transition-colors">
                    <span className="text-xs text-zinc-300 flex items-center justify-center space-x-2">
                      <Upload className="w-4 h-4 text-taxi-yellow" />
                      <span>{uploadingLogo ? 'Uploading to GitHub /Logo...' : 'Upload Logo (Auto-saves to GitHub /Logo)'}</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="space-y-1">
                    <input
                      type="url"
                      value={siteLogoUrl}
                      onChange={(e) => setSiteLogoUrl(e.target.value)}
                      placeholder="Direct Logo URL (Auto-fills on upload or enter https://...)"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                    />
                    <p className="text-[10px] text-zinc-500 pl-1">
                      Auto-renames to <span className="font-mono text-zinc-400">pb08taxi-logo-[ts].ext</span> and pushes to GitHub <span className="font-mono text-taxi-yellow font-bold">Logo/</span> folder.
                    </p>
                  </div>
                </div>
              </div>

              {/* Site Favicon Section */}
              <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Site Favicon (Browser Tab Icon)
                  </span>
                  {siteFaviconUrl && (
                    <button
                      type="button"
                      onClick={() => setSiteFaviconUrl('')}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Reset to Default</span>
                    </button>
                  )}
                </div>

                {/* Recommended specifications */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-bold text-taxi-yellow">Recommended Specifications:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                    <li><strong>Pixel Size:</strong> 32 × 32 px or 64 × 64 px (Square 1:1)</li>
                    <li><strong>Format:</strong> .ICO, .PNG, or .SVG</li>
                    <li><strong>Max File Size:</strong> 512 KB</li>
                  </ul>
                </div>

                {/* Favicon Preview */}
                <div className="h-28 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center p-3 relative overflow-hidden">
                  {siteFaviconUrl ? (
                    <div className="flex flex-col items-center space-y-2">
                      <img src={siteFaviconUrl} alt="Favicon Preview" className="w-10 h-10 object-contain" />
                      <span className="text-[10px] text-zinc-500 font-mono">Live in browser tab</span>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-600 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 text-zinc-700" />
                      <span>Using default taxi SVG favicon</span>
                    </div>
                  )}
                </div>

                {/* Upload or URL */}
                <div className="space-y-2">
                  <label className="cursor-pointer block bg-zinc-900 hover:bg-zinc-850 border border-dashed border-zinc-700 hover:border-taxi-yellow rounded-xl p-3 text-center transition-colors">
                    <span className="text-xs text-zinc-300 flex items-center justify-center space-x-2">
                      <Upload className="w-4 h-4 text-taxi-yellow" />
                      <span>{uploadingFavicon ? 'Uploading to GitHub /Logo...' : 'Upload Favicon (Auto-saves to GitHub /Logo)'}</span>
                    </span>
                    <input
                      type="file"
                      accept=".ico,.png,.svg,.webp,image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="space-y-1">
                    <input
                      type="url"
                      value={siteFaviconUrl}
                      onChange={(e) => setSiteFaviconUrl(e.target.value)}
                      placeholder="Direct Favicon URL (Auto-fills on upload or enter https://...)"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                    />
                    <p className="text-[10px] text-zinc-500 pl-1">
                      Auto-renames to <span className="font-mono text-zinc-400">pb08taxi-favicon-[ts].ext</span> and pushes to GitHub <span className="font-mono text-taxi-yellow font-bold">Logo/</span> folder.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Form 3: Booking Modal Outer Animation Presets */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Booking Modal Outer Animation Presets</h2>
                <p className="text-xs text-zinc-400">
                  Select the ambient halo or neon aura style displayed outside the booking form. The inner form stays 100% static & stable.
                </p>
              </div>
            </div>

            {/* Animation Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODAL_ANIMATION_OPTIONS.map((opt) => {
                const isSelected = bookingModalAnimation === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setBookingModalAnimation(opt.id)}
                    className={`relative cursor-pointer rounded-2xl p-4 transition-all border flex flex-col justify-between select-none ${
                      isSelected
                        ? 'bg-taxi-yellow/10 border-taxi-yellow shadow-lg shadow-taxi-yellow/10 ring-1 ring-taxi-yellow/40'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Header: Title + Tag + Radio Check */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-white flex items-center space-x-1.5">
                          <span>{opt.name}</span>
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-taxi-yellow border-taxi-yellow text-black' : 'border-zinc-700 text-transparent'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      <div className="mb-2.5">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-taxi-yellow/20 text-taxi-yellow' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {opt.tag}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed mb-4 min-h-[38px]">
                        {opt.description}
                      </p>
                    </div>

                    {/* Live Miniature Simulation Box */}
                    <div className="h-28 bg-black/95 rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-850 p-2">
                      {/* Outer Animation Effect on mini-box */}
                      {opt.id === 'golden-glow' && (
                        <>
                          <div className="absolute -inset-1 bg-gradient-to-r from-taxi-yellow/60 via-amber-400/50 to-yellow-500/60 rounded-xl animate-outer-golden-glow pointer-events-none blur-sm" />
                          <div className="absolute -inset-0.5 bg-taxi-yellow/20 rounded-xl blur-xs pointer-events-none" />
                        </>
                      )}

                      {opt.id === 'cyber-neon' && (
                        <>
                          <div className="absolute -inset-0.5 rounded-xl p-[2px] overflow-hidden pointer-events-none">
                            <div className="absolute -inset-[150%] animate-cyber-neon-spin bg-[conic-gradient(from_0deg,#FACC15,#EAB308,#CA8A04,#121212,#FACC15)]" />
                          </div>
                          <div className="absolute -inset-2 bg-taxi-yellow/20 rounded-xl blur-md animate-pulse pointer-events-none" />
                        </>
                      )}

                      {opt.id === 'ambient-breath' && (
                        <>
                          <div className="absolute -inset-2 bg-gradient-to-br from-taxi-yellow/45 via-amber-600/30 to-yellow-500/40 rounded-xl animate-ambient-deep-breath pointer-events-none blur-md" />
                        </>
                      )}

                      {opt.id === 'radar-ripple' && (
                        <>
                          <div className="absolute -inset-0.5 rounded-xl border border-taxi-yellow/70 animate-radar-ripple-1 pointer-events-none" />
                          <div className="absolute -inset-0.5 rounded-xl border border-amber-400/50 animate-radar-ripple-2 pointer-events-none" />
                          <div className="absolute -inset-1 bg-taxi-yellow/15 rounded-xl blur-sm pointer-events-none" />
                        </>
                      )}

                      {opt.id === 'aurora-shimmer' && (
                        <>
                          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/60 via-amber-500/50 via-yellow-200/50 to-amber-600/60 rounded-xl blur-md animate-aurora-shimmer pointer-events-none" />
                        </>
                      )}

                      {/* Mini Static Form Card (Stationary) */}
                      <div className="relative z-10 w-32 bg-[#121212] border border-zinc-700/80 rounded-lg p-2 shadow-md flex flex-col space-y-1.5 pointer-events-none">
                        <div className="flex items-center space-x-1">
                          <div className="w-2.5 h-2.5 rounded bg-taxi-yellow" />
                          <div className="w-12 h-1.5 bg-zinc-600 rounded" />
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded border border-zinc-700/50" />
                        <div className="w-full h-2 bg-zinc-800 rounded border border-zinc-700/50" />
                        <div className="w-full h-2.5 bg-taxi-yellow/90 rounded flex items-center justify-center">
                          <div className="w-8 h-1 bg-black/60 rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-taxi-yellow font-bold' : 'text-zinc-500'}>
                        {isSelected ? '● Active Preset' : 'Click to Select'}
                      </span>
                      <span className="text-zinc-600 font-mono text-[10px]">
                        #{opt.id}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-taxi-yellow mt-0.5 flex-shrink-0" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-white">Live Feedback Note:</strong> When you click <strong className="text-taxi-yellow">"Save Site Settings"</strong> below, your selected outer animation preset will immediately reflect across the entire site for the <strong className="text-white">"One Click Book Your Ride"</strong> modal without requiring any page reload.
              </p>
            </div>
          </div>

          {/* Form 4: Social Media Profile Links */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Social Media Profiles &amp; Links</h2>
                <p className="text-xs text-zinc-400">
                  Manage official social links displayed dynamically in the website footer and Schema.org LocalBusiness metadata.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Facebook URL */}
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-[#1877F2]/20 text-[#1877F2] font-black flex items-center justify-center text-xs">f</span>
                    <span>Facebook Profile / Page URL</span>
                  </label>
                  {socialFacebook && (
                    <a
                      href={socialFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-taxi-yellow hover:underline flex items-center space-x-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  placeholder="https://facebook.com/pb08taxi"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500">Official Facebook business page link.</p>
              </div>

              {/* Instagram URL */}
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white font-black flex items-center justify-center text-[10px]">IG</span>
                    <span>Instagram Profile URL</span>
                  </label>
                  {socialInstagram && (
                    <a
                      href={socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-taxi-yellow hover:underline flex items-center space-x-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="https://instagram.com/pb08taxi"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500">Official Instagram handle link.</p>
              </div>

              {/* Twitter / X URL */}
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-white/10 text-white font-black flex items-center justify-center text-xs">𝕏</span>
                    <span>Twitter / X Profile URL</span>
                  </label>
                  {socialTwitter && (
                    <a
                      href={socialTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-taxi-yellow hover:underline flex items-center space-x-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  placeholder="https://twitter.com/pb08taxi"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500">Official Twitter/X page link.</p>
              </div>

              {/* YouTube Channel URL */}
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-[#FF0000]/20 text-[#FF0000] font-black flex items-center justify-center text-xs">▶</span>
                    <span>YouTube Channel URL</span>
                  </label>
                  {socialYoutube && (
                    <a
                      href={socialYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-taxi-yellow hover:underline flex items-center space-x-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={socialYoutube}
                  onChange={(e) => setSocialYoutube(e.target.value)}
                  placeholder="https://youtube.com/@pb08taxi"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500">Official YouTube channel or video link.</p>
              </div>

            </div>

            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850 flex items-start space-x-3">
              <Globe className="w-4 h-4 text-taxi-yellow mt-0.5 flex-shrink-0" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-white">Instant Sync:</strong> Changing these links and clicking <strong className="text-taxi-yellow">"Save Site Settings"</strong> updates the icons and links in the website footer and updates Google Schema.org structured data in real-time.
              </p>
            </div>
          </div>

          {/* Form 5: Login Page Credentials Hint Display */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-850">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Login Page Security</h2>
                <p className="text-xs text-zinc-400">
                  Control visibility of default credentials hint on <code className="text-zinc-300">/admin/login</code>.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCredentialsHint}
                  onChange={(e) => setShowCredentialsHint(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow accent-taxi-yellow cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-white block">
                    Show "Default credentials: admin / PB08Taxi@2026!" on Login Page
                  </span>
                  <span className="text-xs text-zinc-400 leading-relaxed block mt-0.5">
                    Untick this box in production to hide the credentials helper from public visitors.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button for Site Settings */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="bg-taxi-yellow hover:bg-taxi-yellowHover disabled:opacity-60 text-black font-black text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <span>Save Site Settings</span>
              )}
            </button>
          </div>

        </form>

        {/* Section 4: Admin ID & Password Management */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
            <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Change Admin ID & Password</h2>
              <p className="text-xs text-zinc-400">
                Update administrator login credentials with secure bcrypt password hashing.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangeCredentials} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Current Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Current Admin ID (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    disabled
                    value={currentUsername}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-zinc-400 outline-none cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* New Username (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  New Admin ID (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Leave blank to keep current ID"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                  />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Current Password (Required) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Current Password <span className="text-taxi-yellow">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white"
                    title={showCurrentPass ? "Hide password" : "Show password"}
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white"
                    title={showNewPass ? "Hide password" : "Show password"}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white"
                    title={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingCreds}
                className="bg-taxi-yellow hover:bg-taxi-yellowHover disabled:opacity-60 text-black font-black text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                {savingCreds ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Credentials...</span>
                  </>
                ) : (
                  <span>Update Admin ID & Password</span>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Section 5: Danger Zone - Factory Reset */}
        <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-red-900/30">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-900/40">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-300">Danger Zone — Factory Reset Website</h2>
              <p className="text-xs text-red-200/60">
                Permanently clear all bookings, customers, drivers, message logs, and restore settings to a fresh clean state.
              </p>
            </div>
          </div>

          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl text-xs text-zinc-300 space-y-2">
            <p className="font-bold text-red-400 flex items-center space-x-1.5">
              <span>⚠️ What happens during Factory Reset:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
              <li>All customer booking records and ride history will be deleted.</li>
              <li>All customer profiles and drivers will be completely wiped.</li>
              <li>All WhatsApp message delivery logs and marketing consents will be cleared.</li>
              <li>Homepage slider images and message templates will be restored to fresh defaults.</li>
              <li><strong className="text-emerald-400">Safe:</strong> Admin credentials and active WhatsApp pairing session are safely preserved.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="text-xs text-zinc-400">
              Requires Secret Authorization PIN: <span className="font-mono text-taxi-yellow font-bold">333725</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setResetPin('');
                setResetError('');
                setResetSuccess('');
                setShowResetModal(true);
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-red-950/60 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Factory Reset Website</span>
            </button>
          </div>
        </div>

      </div>

      {/* Factory Reset Modal Confirmation Popup */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-red-800/80 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            {/* Close button */}
            <button
              type="button"
              disabled={resetting}
              onClick={() => setShowResetModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon & Heading */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 mx-auto flex items-center justify-center shadow-lg shadow-red-950/50">
                <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-white">Confirm Factory Reset</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This action is <span className="text-red-400 font-bold">irreversible</span>. All bookings, customers, drivers, and message dispatches will be permanently wiped clean.
              </p>
            </div>

            {/* Alerts */}
            {resetSuccess && (
              <div className="p-4 bg-emerald-950/70 border border-emerald-800 rounded-2xl text-emerald-200 text-xs flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="font-bold">{resetSuccess}</span>
              </div>
            )}
            {resetError && (
              <div className="p-4 bg-red-950/70 border border-red-800 rounded-2xl text-red-200 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {/* PIN Input Form */}
            <form onSubmit={handleFactoryReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 text-center">
                  Enter Secret PIN to Authorize:
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    maxLength={10}
                    autoFocus
                    required
                    disabled={resetting || !!resetSuccess}
                    value={resetPin}
                    onChange={(e) => setResetPin(e.target.value)}
                    placeholder="Enter PIN 333725"
                    className="w-full bg-zinc-900 border-2 border-red-900/60 focus:border-red-500 rounded-2xl py-3 pl-12 pr-4 text-center text-lg sm:text-xl font-mono tracking-widest text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 text-center mt-1.5">
                  Type <span className="font-mono text-taxi-yellow font-bold">333725</span> to confirm reset
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs py-3.5 rounded-xl border border-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting || !resetPin || !!resetSuccess}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Confirm Reset</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
