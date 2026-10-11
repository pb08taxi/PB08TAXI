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
  X
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

export default function AdminSettingsPage() {
  const { refreshSettings: refreshGlobalSettings } = useSiteSettings();
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
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);

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
      setShowCredentialsHint(data.show_credentials_hint ?? false);
      setCurrentUsername(data.admin_username || 'admin');
    }
  }, [data]);

  // Handle saving general site settings (phone, whatsapp, logo, favicon, hint)
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
        show_credentials_hint: showCredentialsHint
      };
      await updateAdminSettings(payload);
      mutate((prev) => ({ ...prev, ...payload }));
      await refreshGlobalSettings();
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

          {/* Form 2: Brand Assets (Site Logo & Favicon) */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-zinc-850">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow text-black flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Site Branding (Logo & Favicon)</h2>
                <p className="text-xs text-zinc-400">
                  Upload custom branding assets with recommended sizes and resolutions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Site Logo Section */}
              <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Site Logo
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

                {/* Logo Preview */}
                <div className="h-28 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center p-3 relative overflow-hidden">
                  {siteLogoUrl ? (
                    <img src={siteLogoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-zinc-600 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 text-zinc-700" />
                      <span>Using default PB08 TAXI badge logo</span>
                    </div>
                  )}
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

          {/* Form 3: Login Page Credentials Hint Display */}
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
