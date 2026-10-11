import React, { useState, useEffect } from 'react';
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
  EyeOff
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { 
  getAdminSliders, 
  createSlider, 
  updateSlider, 
  deleteSlider, 
  uploadSliderImage 
} from '../api/client';

export default function AdminSliderPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await getAdminSliders();
      setSlides(data);
    } catch (err) {
      console.error("Failed to load slides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

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
      fetchSlides();
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
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete slide.");
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      const updated = await updateSlider(slide.id, { is_active: !slide.is_active });
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
    } catch (err) {
      alert("Failed to update slide status.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Homepage Slider Manager</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Add, upload, reorder, and edit hero slides. Changes appear on the public website immediately without redeployment!
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 bg-taxi-yellow hover:bg-taxi-yellowHover text-black px-5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all self-start"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Slide</span>
          </button>
        </div>

        {/* Live Notification Banner */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex items-center space-x-3 text-xs text-zinc-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span>
            Connected to <strong>Neon PostgreSQL</strong>. Active slides are fetched dynamically on the homepage with zero downtime.
          </span>
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
    </AdminLayout>
  );
}
