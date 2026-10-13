import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle, 
  X, 
  RefreshCw,
  Image as ImageIcon,
  ArrowUpDown,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Save,
  Check
} from 'lucide-react';
import { 
  getAdminSliders, 
  createSlider, 
  updateSlider, 
  deleteSlider, 
  uploadSliderImage,
  updateAdminSettings
} from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function AdminSliderPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const { data, loading, isRevalidating, refresh, mutate } = useAdminQuery(
    'admin_sliders',
    getAdminSliders,
    { ttl: 3 * 60 * 1000 }
  );

  const slides = data || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  // Transition & Fade in / Fade out states
  const [transitionEffect, setTransitionEffect] = useState(settings?.slider_transition_effect || 'fade');
  const [fadeDuration, setFadeDuration] = useState(Number(settings?.slider_fade_duration) || 1000);
  const [autoplayInterval, setAutoplayInterval] = useState(Number(settings?.slider_autoplay_interval) || 5500);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync when settings context updates
  useEffect(() => {
    if (settings) {
      if (settings.slider_transition_effect) setTransitionEffect(settings.slider_transition_effect);
      if (settings.slider_fade_duration) setFadeDuration(Number(settings.slider_fade_duration));
      if (settings.slider_autoplay_interval) setAutoplayInterval(Number(settings.slider_autoplay_interval));
    }
  }, [settings]);

  // Live Interactive Preview State
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(true);
  const previewTimerRef = useRef(null);

  const activeSlides = slides.filter((s) => s.is_active);
  const previewSlides = activeSlides.length > 0 ? activeSlides : (slides.length > 0 ? slides : [
    {
      id: 'p1',
      title: "PB08 TAXI — 24/7 Premium Cabs in Punjab",
      subtitle: "Reliable, Safe & Air-Conditioned Rides at Affordable Fixed Rates",
      image_url: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'p2',
      title: "Airport Pickups & Outstation Journeys",
      subtitle: "Direct transfers to Amritsar, Chandigarh & Delhi Airports with On-Time Guarantee",
      image_url: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'p3',
      title: "Verified Drivers & Sanitized Fleet",
      subtitle: "Instant WhatsApp Confirmation & Dedicated Customer Support",
      image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80"
    }
  ]);

  useEffect(() => {
    if (!previewPlaying || previewSlides.length <= 1) return;
    previewTimerRef.current = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % previewSlides.length);
    }, autoplayInterval);

    return () => clearInterval(previewTimerRef.current);
  }, [previewPlaying, previewSlides.length, autoplayInterval]);

  const handleNextPreview = () => {
    setPreviewIndex((prev) => (prev + 1) % previewSlides.length);
  };

  const handlePrevPreview = () => {
    setPreviewIndex((prev) => (prev - 1 + previewSlides.length) % previewSlides.length);
  };

  const handleSaveSliderSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      await updateAdminSettings({
        slider_transition_effect: transitionEffect,
        slider_fade_duration: fadeDuration,
        slider_autoplay_interval: autoplayInterval,
      });
      if (refreshSettings) await refreshSettings();
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3500);
    } catch (err) {
      alert("Failed to save slider transition settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormImageUrl('');
    setFormOrder(slides.length + 1);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (slide) => {
    setEditingSlide(slide);
    setFormTitle(slide.title);
    setFormSubtitle(slide.subtitle || '');
    setFormImageUrl(slide.image_url);
    setFormOrder(slide.sort_order);
    setFormIsActive(slide.is_active);
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadSliderImage(file);
      setFormImageUrl(res.url);
    } catch (err) {
      alert("Failed to upload image. Please check file format (JPG, PNG, WEBP).");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImageUrl.trim()) {
      alert("Please provide both a slide heading and an image.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || null,
        image_url: formImageUrl.trim(),
        sort_order: parseInt(formOrder, 10) || 0,
        is_active: formIsActive
      };

      if (editingSlide) {
        await updateSlider(editingSlide.id, payload);
      } else {
        await createSlider(payload);
      }

      setModalOpen(false);
      refresh();
      adminCache.invalidate('admin_sliders');
    } catch (err) {
      alert("Error saving slider image.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide from the homepage?")) return;
    try {
      await deleteSlider(id);
      mutate((prev) => (prev ? prev.filter((s) => s.id !== id) : []));
    } catch (err) {
      alert("Failed to delete slide.");
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      const updated = await updateSlider(slide.id, { is_active: !slide.is_active });
      mutate((prev) => (prev ? prev.map((s) => (s.id === slide.id ? updated : s)) : []));
    } catch (err) {
      alert("Failed to update slide status.");
    }
  };

  return (
    <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Homepage Slider Manager</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Add, upload, reorder, and edit hero slides. Changes appear on the public website immediately without redeployment!
            </p>
          </div>
          <div className="flex items-center space-x-3 self-start">
            <button
              onClick={() => refresh()}
              disabled={loading || isRevalidating}
              className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
              <span>{isRevalidating ? 'Updating...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-2 bg-taxi-yellow hover:bg-taxi-yellowHover text-black px-5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Slide</span>
            </button>
          </div>
        </div>

        {/* Live Notification Banner */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span>
              Connected to <strong>Neon PostgreSQL</strong>. Active slides & transition settings are fetched dynamically on the homepage with zero downtime.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-taxi-yellow/10 text-taxi-yellow font-mono text-[11px] font-bold border border-taxi-yellow/20">
            Current: {transitionEffect.toUpperCase()} ({fadeDuration}ms)
          </span>
        </div>

        {/* Transition & Fade Settings with Live Interactive Preview */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-850">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-taxi-yellow/10 border border-taxi-yellow/20 flex items-center justify-center text-taxi-yellow flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
                  <span>Slider Animation & Fade Transition Controls</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-taxi-yellow/20 text-taxi-yellow border border-taxi-yellow/30 font-bold">
                    Admin Setting
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tune "fade in" / "fade out" transition speed, autoplay interval, and animation style with real-time live preview before saving.
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveSliderSettings}
              disabled={savingSettings}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md self-start sm:self-auto ${
                settingsSaved
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                  : 'bg-taxi-yellow hover:bg-taxi-yellowHover text-black shadow-taxi-yellow/20 hover:scale-105 active:scale-95'
              }`}
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : settingsSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved to Neon DB!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Transition Settings</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Transition Effect Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Transition Style</span>
                  <span className="text-zinc-500 font-normal lowercase">Select animation type</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'fade', name: 'Fade In / Out', desc: 'Smooth crossfade opacity transition' },
                    { id: 'zoom-fade', name: 'Zoom & Fade', desc: 'Cinematic subtle scale with smooth fade' },
                    { id: 'slide', name: 'Horizontal Slide', desc: 'Dynamic transform slider motion' },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => setTransitionEffect(eff.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all ${
                        transitionEffect === eff.id
                          ? 'bg-taxi-yellow/10 border-taxi-yellow text-white shadow-md shadow-taxi-yellow/10 ring-1 ring-taxi-yellow/40'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{eff.name}</span>
                        {transitionEffect === eff.id && (
                          <div className="w-2 h-2 rounded-full bg-taxi-yellow" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{eff.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fade Duration Slider */}
              <div className="bg-zinc-900/70 border border-zinc-850 p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      2. Fade In / Out Duration (Speed)
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Controls how smoothly the previous slide fades out while the next slide fades in.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-taxi-yellow/15 border border-taxi-yellow/30 text-taxi-yellow font-mono text-xs font-black">
                    {(fadeDuration / 1000).toFixed(1)}s ({fadeDuration}ms)
                  </span>
                </div>

                <input
                  type="range"
                  min="300"
                  max="3000"
                  step="100"
                  value={fadeDuration}
                  onChange={(e) => setFadeDuration(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-taxi-yellow"
                />

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>0.3s (Super Fast)</span>
                  <span>1.0s (Smooth Default)</span>
                  <span>2.0s (Slow Fade)</span>
                  <span>3.0s (Ultra Slow)</span>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {[
                    { label: 'Fast (500ms)', val: 500 },
                    { label: 'Default (1000ms)', val: 1000 },
                    { label: 'Smooth (1400ms)', val: 1400 },
                    { label: 'Cinematic (2000ms)', val: 2000 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setFadeDuration(p.val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        fadeDuration === p.val
                          ? 'bg-taxi-yellow text-black font-extrabold'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Autoplay Interval Slider */}
              <div className="bg-zinc-900/70 border border-zinc-850 p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      3. Slide Auto-Change Interval (Display Time)
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      How long each slide remains in view before the transition begins.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-taxi-yellow/15 border border-taxi-yellow/30 text-taxi-yellow font-mono text-xs font-black">
                    {(autoplayInterval / 1000).toFixed(1)}s ({autoplayInterval}ms)
                  </span>
                </div>

                <input
                  type="range"
                  min="2000"
                  max="12000"
                  step="500"
                  value={autoplayInterval}
                  onChange={(e) => setAutoplayInterval(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-taxi-yellow"
                />

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>2.0s (Rapid)</span>
                  <span>5.5s (Recommended)</span>
                  <span>8.0s (Relaxed)</span>
                  <span>12.0s (Long)</span>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {[
                    { label: '3.0s', val: 3000 },
                    { label: '4.5s', val: 4500 },
                    { label: '5.5s (Default)', val: 5500 },
                    { label: '7.0s', val: 7000 },
                    { label: '10.0s', val: 10000 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setAutoplayInterval(p.val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        autoplayInterval === p.val
                          ? 'bg-taxi-yellow text-black font-extrabold'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Live Interactive Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-taxi-yellow animate-ping inline-block mr-1" />
                  <span>Real-Time Live Preview</span>
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewPlaying(!previewPlaying)}
                    title={previewPlaying ? 'Pause Auto-cycle' : 'Resume Auto-cycle'}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                  >
                    {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPreview}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-taxi-yellow hover:text-taxi-yellowHover border border-zinc-800 text-[11px] font-bold transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Test Fade</span>
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl group select-none">
                {previewSlides.map((slide, idx) => {
                  const isActive = idx === previewIndex;
                  let transformClass = 'scale-100 translate-x-0';
                  if (transitionEffect === 'zoom-fade') {
                    transformClass = isActive ? 'scale-100' : 'scale-110';
                  } else if (transitionEffect === 'slide') {
                    transformClass = isActive ? 'translate-x-0' : (idx > previewIndex ? 'translate-x-full' : '-translate-x-full');
                  }

                  return (
                    <div
                      key={slide.id || idx}
                      className={`absolute inset-0 transition-opacity will-change-transform ${
                        isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                      style={{
                        transitionDuration: `${fadeDuration}ms`,
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className={`w-full h-full object-cover filter brightness-75 transition-transform ${transformClass}`}
                        style={{
                          transitionDuration: `${fadeDuration}ms`,
                          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] font-mono font-bold text-taxi-yellow tracking-widest uppercase">
                          Slide #{idx + 1} of {previewSlides.length} • {transitionEffect.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                          {slide.title}
                        </h4>
                        <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                          {slide.subtitle || 'PB08 Taxi Punjab Rides'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Left / Right Nav Arrows inside Preview */}
                <button
                  type="button"
                  onClick={handlePrevPreview}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm transition-transform active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPreview}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm transition-transform active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dots indicator */}
                <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                  {previewSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setPreviewIndex(dotIdx)}
                      className={`h-1.5 rounded-full transition-all ${
                        dotIdx === previewIndex ? 'w-4 bg-taxi-yellow' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-mono text-zinc-300">
                  {previewPlaying ? 'Auto-cycling' : 'Paused'}
                </div>
              </div>

              {/* Status info below preview */}
              <div className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-xl flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Effect: <strong className="text-zinc-200">{transitionEffect}</strong></span>
                <span>Fade: <strong className="text-taxi-yellow">{fadeDuration}ms</strong></span>
                <span>Interval: <strong className="text-zinc-200">{autoplayInterval}ms</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Slides List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && slides.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500">
              Loading slides...
            </div>
          ) : slides.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 bg-zinc-950 border border-zinc-850 rounded-3xl">
              No slides configured. Click "Add New Slide" to create the first one!
            </div>
          ) : (
            slides.map((slide) => (
              <div
                key={slide.id}
                className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-taxi-yellow/40 transition-colors shadow-lg"
              >
                {/* Image Preview with Overlay */}
                <div className="relative h-48 bg-zinc-900 overflow-hidden">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-taxi-yellow border border-white/10">
                    Order #{slide.sort_order}
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md flex items-center space-x-1 ${
                        slide.is_active
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-zinc-900/80 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {slide.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{slide.is_active ? 'ACTIVE' : 'HIDDEN'}</span>
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{slide.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {slide.subtitle || 'No subtitle provided'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEdit(slide)}
                      className="inline-flex items-center space-x-1.5 text-zinc-300 hover:text-taxi-yellow font-bold py-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Slide</span>
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="inline-flex items-center space-x-1.5 text-red-400 hover:text-red-300 font-bold py-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Slide Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative text-white">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  {editingSlide ? 'Edit Slide Details' : 'Add New Homepage Slide'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Update slide text, upload photos, or change display order.
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Heading */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Slide Heading <span className="text-taxi-yellow">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. 24/7 Airport Pickups in Punjab"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-3 px-4 text-sm text-white outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Description / Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Reliable, Safe & Air-Conditioned Rides at Affordable Fixed Rates"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>

                {/* Image Upload or URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Slide Image <span className="text-taxi-yellow">*</span>
                  </label>
                  
                  <div className="space-y-3">
                    {/* File upload input */}
                    <div className="flex items-center space-x-3">
                      <label className="flex-1 cursor-pointer bg-zinc-900 hover:bg-zinc-850 border border-dashed border-zinc-700 hover:border-taxi-yellow rounded-xl p-3 text-center transition-colors">
                        <span className="text-xs text-zinc-300 flex items-center justify-center space-x-2">
                          <Upload className="w-4 h-4 text-taxi-yellow" />
                          <span>{uploading ? 'Uploading Image...' : 'Upload Image File (JPG/PNG/WEBP)'}</span>
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Or URL input */}
                    <div>
                      <input
                        type="url"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  {formImageUrl && (
                    <div className="mt-3 relative h-28 rounded-xl overflow-hidden border border-zinc-800">
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-2 bg-black/80 text-[10px] px-2 py-0.5 rounded text-zinc-300">
                        Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Order & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formOrder}
                      onChange={(e) => setFormOrder(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-xl py-2.5 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="rounded bg-zinc-900 border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow w-4 h-4 accent-taxi-yellow"
                      />
                      <span className="text-xs text-zinc-300 font-bold select-none">
                        Active on Homepage
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold py-3 rounded-xl text-xs transition-colors shadow-md"
                  >
                    {saving ? 'Saving...' : editingSlide ? 'Save Changes' : 'Create Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
  );
}
