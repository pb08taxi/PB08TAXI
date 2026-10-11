import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Plus, 
  Phone, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  X, 
  AlertTriangle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  getDrivers, 
  createDriver, 
  updateDriver, 
  deleteDriver, 
  toggleDriverActive 
} from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';

export default function AdminDriversPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    taxi_registration: '',
    is_active: true
  });
  const [phone10, setPhone10] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryKey = `admin_drivers_${statusFilter}`;
  const { data, loading, isRevalidating, refresh, mutate } = useAdminQuery(
    queryKey,
    () => getDrivers(statusFilter),
    { ttl: 2 * 60 * 1000 }
  );

  const driversList = data || [];

  // Filter in memory for instantaneous search experience
  const filteredDrivers = driversList.filter((d) => {
    if (!debouncedSearch.trim()) return true;
    const q = debouncedSearch.toLowerCase().trim();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.taxi_registration && d.taxi_registration.toLowerCase().includes(q)) ||
      (d.contact_number && d.contact_number.includes(q))
    );
  });

  const totalDrivers = driversList.length;
  const activeDrivers = driversList.filter(d => d.is_active).length;
  const totalRidesAssigned = driversList.reduce((acc, d) => acc + (d.total_rides || 0), 0);

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      taxi_registration: '',
      is_active: true
    });
    setPhone10('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || '',
      taxi_registration: driver.taxi_registration || '',
      is_active: driver.is_active ?? true
    });
    const digits = (driver.contact_number || '').replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
    setPhone10(digits);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Driver name is required.');
      return;
    }
    if (!formData.taxi_registration.trim()) {
      setFormError('Taxi registration number is required (e.g., PB01CC1372).');
      return;
    }
    const cleanDigits = phone10.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number for driver (e.g., 98765 43210).');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        taxi_registration: formData.taxi_registration.trim().toUpperCase(),
        contact_number: `+91${cleanDigits}`,
        is_active: Boolean(formData.is_active)
      };

      if (editingDriver) {
        const updated = await updateDriver(editingDriver.id, payload);
        mutate((prev) =>
          prev ? prev.map((d) => (d.id === editingDriver.id ? { ...d, ...updated } : d)) : []
        );
      } else {
        const created = await createDriver(payload);
        mutate((prev) => (prev ? [created, ...prev] : [created]));
      }

      adminCache.invalidate('admin_drivers');
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save driver details. Please verify the phone number.';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (driver) => {
    try {
      const res = await toggleDriverActive(driver.id);
      mutate((prev) =>
        prev ? prev.map((d) => (d.id === driver.id ? { ...d, is_active: res.is_active } : d)) : []
      );
      adminCache.invalidate('admin_drivers');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to toggle driver status.');
    }
  };

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return;
    try {
      setDeleteSubmitting(true);
      await deleteDriver(deletingDriver.id);
      mutate((prev) => (prev ? prev.filter((d) => d.id !== deletingDriver.id) : []));
      adminCache.invalidate('admin_drivers');
      setDeletingDriver(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete driver.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
              <Car className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-white">Driver Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage PB08 TAXI fleet drivers, assign duties on booking confirmation, and track rides.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => refresh()}
            disabled={loading || isRevalidating}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
            title="Refresh driver records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Updating...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 bg-taxi-yellow hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-taxi-yellow/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Driver</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Fleet Drivers</span>
            <Car className="w-4 h-4 text-taxi-yellow" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalDrivers}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Verified drivers in database</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active on Duty</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{activeDrivers}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Ready for ride assignments</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-taxi-yellow uppercase tracking-wider">Total Completed Rides</span>
            <ShieldCheck className="w-4 h-4 text-taxi-yellow" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalRidesAssigned}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Bookings fulfilled across fleet</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl px-4 py-2.5 flex items-center space-x-3 flex-1">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver by name, plate number (e.g., PB01CC1372), or phone..."
            className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center bg-zinc-950 border border-zinc-850 p-1 rounded-2xl self-start sm:self-auto space-x-1">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                statusFilter === st
                  ? 'bg-taxi-yellow text-black shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Driver List Table */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-taxi-yellow" />
            <h2 className="text-base font-bold text-white">
              Fleet Drivers ({filteredDrivers.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-500">
            {activeDrivers} active out of {totalDrivers} drivers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40 border-b border-zinc-850">
              <tr>
                <th className="py-3.5 px-6">Driver Details</th>
                <th className="py-3.5 px-6">Taxi Reg. Number</th>
                <th className="py-3.5 px-6">Contact Number</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Assigned Rides</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {loading && driversList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-taxi-yellow" />
                      <span>Loading driver fleet records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Car className="w-8 h-8 text-zinc-700" />
                      <p className="text-sm font-semibold text-zinc-400">No fleet drivers found</p>
                      <p className="text-xs text-zinc-600">Click "Add New Driver" to register a driver with taxi registration number.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Driver Name & Initials */}
                    <td className="py-4 px-6 font-bold text-white text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-taxi-yellow/20 to-amber-600/20 border border-taxi-yellow/30 flex items-center justify-center text-taxi-yellow font-black text-xs uppercase flex-shrink-0">
                          {driver.name ? driver.name.substring(0, 2) : 'DR'}
                        </div>
                        <div>
                          <div className="text-white font-extrabold">{driver.name}</div>
                          <div className="text-[10px] text-zinc-500 font-normal">
                            Added: {new Date(driver.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Taxi Plate Reg Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-900 text-amber-300 font-mono font-bold tracking-wider text-xs border border-amber-400/30 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                        {driver.taxi_registration}
                      </span>
                    </td>

                    {/* Contact Number with WhatsApp link */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-zinc-300 font-medium">{driver.contact_number}</span>
                        <a
                          href={`https://wa.me/${driver.contact_number.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    {/* Active/Inactive Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(driver)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                          driver.is_active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Click to toggle active status"
                      >
                        {driver.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-500" />
                            <span>OFF DUTY</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Total Rides */}
                    <td className="py-4 px-6 text-center">
                      <span className="bg-zinc-900 text-taxi-yellow px-3 py-1 rounded-full border border-zinc-800 font-bold">
                        {driver.total_rides || 0} rides
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(driver)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                          title="Edit driver"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingDriver(driver)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 transition-colors"
                          title="Delete driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
                  <Car className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingDriver ? 'Edit Driver Details' : 'Add New Fleet Driver'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {editingDriver ? 'Update driver contact and vehicle info' : 'Register taxi registration and driver phone number'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Driver Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Driver Name <span className="text-taxi-yellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-taxi-yellow transition-colors"
                />
              </div>

              {/* Taxi Registration Number */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Taxi Registration Number <span className="text-taxi-yellow">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.taxi_registration}
                    onChange={(e) => setFormData({ ...formData, taxi_registration: e.target.value.toUpperCase() })}
                    placeholder="e.g. PB01CC1372"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 uppercase font-mono tracking-wider focus:outline-none focus:border-taxi-yellow transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Format: PB01CC1372 (Official vehicle number plate displayed to customers upon confirmation)
                </p>
              </div>

              {/* Driver Contact with separated +91 badge & 10-digit lock */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>
                    Driver Contact / WhatsApp Number <span className="text-taxi-yellow">*</span>
                  </span>
                  <span className={`text-[11px] font-mono ${phone10.length === 10 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {phone10.length}/10 digits
                  </span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-zinc-800 focus-within:border-taxi-yellow transition-all">
                  <div className="bg-zinc-800/90 px-3.5 py-2.5 text-xs font-bold text-taxi-yellow border-r border-zinc-700 select-none flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-sm leading-none">🇮🇳</span>
                    <span className="font-mono font-black tracking-wider">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={phone10}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone10(digits);
                      setFormError('');
                    }}
                    placeholder="98765 43210"
                    className="w-full bg-zinc-900 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono tracking-wider outline-none"
                  />
                  {phone10.length === 10 && (
                    <div className="pr-3 flex items-center bg-zinc-900 text-emerald-400 flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {phone10.length === 10 ? (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                    ✓ Dispatch duty alerts will be sent to: <strong>+91{phone10}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    WhatsApp booking duty alerts with customer pickup details will be sent to this 10-digit number.
                  </p>
                )}
              </div>

              {/* Active Toggle Checkbox */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer select-none bg-zinc-900/60 border border-zinc-850 p-3 rounded-xl hover:bg-zinc-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow focus:ring-offset-zinc-950 accent-taxi-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Active on Duty</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Driver will appear in the driver assignment list when confirming bookings.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-taxi-yellow hover:bg-yellow-400 text-black shadow-lg shadow-taxi-yellow/10 transition-colors flex items-center space-x-2"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingDriver ? 'Save Changes' : 'Register Driver'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Driver Confirmation Modal */}
      {deletingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-red-900/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Delete Driver?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to remove <span className="text-white font-bold">{deletingDriver.name}</span> ({deletingDriver.taxi_registration})?
                Existing ride history will be preserved.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDriver(null)}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDriver}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-colors flex items-center space-x-2"
              >
                {deleteSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Driver</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
