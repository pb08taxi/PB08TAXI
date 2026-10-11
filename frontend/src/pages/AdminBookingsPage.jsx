import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CalendarCheck, 
  Filter, 
  RefreshCw, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  X, 
  Edit3, 
  MapPin, 
  User, 
  Phone,
  Check,
  AlertCircle,
  Car,
  UserCheck,
  Send,
  ShieldCheck
} from 'lucide-react';
import { getBookings, updateBookingStatus, getDrivers } from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';
import { useToast } from '../context/ToastContext';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Status & Driver Assign Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editStatus, setEditStatus] = useState('PENDING');
  const [editNotes, setEditNotes] = useState('');
  const [assignDriverEnabled, setAssignDriverEnabled] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [sendWhatsAppAlert, setSendWhatsAppAlert] = useState(true);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryKey = `admin_bookings_${activeTab}_${debouncedSearch.trim().toLowerCase()}`;
  const { data, loading, isRevalidating, refresh, mutate } = useAdminQuery(
    queryKey,
    () => getBookings(activeTab, debouncedSearch),
    { ttl: 2 * 60 * 1000 }
  );

  const bookings = data || [];

  // Fetch active drivers when modal opens or assignDriverEnabled toggles
  const fetchActiveDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const list = await getDrivers('ACTIVE');
      setAvailableDrivers(list);
    } catch (err) {
      console.error('Failed to load active drivers:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditNotes(booking.notes || '');
    setModalError('');
    setSendWhatsAppAlert(true);

    if (booking.driver_id) {
      setAssignDriverEnabled(true);
      setSelectedDriverId(booking.driver_id);
    } else {
      setAssignDriverEnabled(booking.status === 'CONFIRMED');
      setSelectedDriverId(null);
    }

    fetchActiveDrivers();
  };

  const handleToggleAssignDriver = (enabled) => {
    setAssignDriverEnabled(enabled);
    if (!enabled) {
      setSelectedDriverId(null);
    } else if (availableDrivers.length === 0) {
      fetchActiveDrivers();
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);
    setModalError('');

    try {
      const driverIdToSend = assignDriverEnabled && selectedDriverId ? selectedDriverId : null;
      const updated = await updateBookingStatus(
        selectedBooking.id, 
        editStatus, 
        editNotes, 
        driverIdToSend, 
        sendWhatsAppAlert
      );

      mutate((prev) =>
        prev ? prev.map((b) => (b.id === updated.id ? updated : b)) : [updated]
      );

      // Invalidate related caches
      adminCache.invalidate('admin_dashboard');
      adminCache.invalidate('admin_drivers');
      setSelectedBooking(null);
      showSuccess(
        `Booking #${selectedBooking.id} (${selectedBooking.booking_reference || 'Ref'}) marked as ${editStatus}!${driverIdToSend ? ' Driver assigned & WhatsApp alert sent.' : ''}`,
        'Booking Status Updated'
      );
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update booking status.';
      setModalError(msg);
      showError(msg, 'Update Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Bookings Management</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Dispatch reservations, assign verified fleet drivers, and send real-time WhatsApp updates.
          </p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading || isRevalidating}
          className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
          <span>{isRevalidating ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-taxi-yellow text-black shadow-md shadow-taxi-yellow/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {tab === 'CONFIRMED' ? 'CONFIRMED (Driver Assigned)' : tab === 'COMPLETED' ? 'COMPLETED (Finished)' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl px-4 py-2.5 flex items-center space-x-3 w-full lg:w-96">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, customer, or phone..."
            className="w-full bg-transparent border-none text-xs text-white placeholder-zinc-500 outline-none"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-taxi-yellow" />
            <h2 className="text-base font-bold text-white">
              Bookings ({bookings.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Showing {activeTab.toLowerCase()} reservations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40 border-b border-zinc-850">
              <tr>
                <th className="py-3.5 px-6">Reference</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Scheduled Pickup</th>
                <th className="py-3.5 px-6">Pickup / Route</th>
                <th className="py-3.5 px-6">Assigned Driver</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-taxi-yellow" />
                      <span>Loading bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CalendarCheck className="w-8 h-8 text-zinc-700" />
                      <p className="text-sm font-semibold text-zinc-400">No bookings found</p>
                      <p className="text-xs text-zinc-600">New ride bookings from the frontend will appear here instantly.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Reference */}
                    <td className="py-4 px-6 font-mono font-bold text-taxi-yellow">
                      <div>#{b.booking_reference}</div>
                      <div className="text-[10px] text-zinc-500 font-normal">
                        {new Date(b.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm">{b.customer_name}</div>
                      <div className="font-mono text-zinc-400 text-[11px] flex items-center space-x-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{b.whatsapp_number}</span>
                      </div>
                    </td>

                    {/* Scheduled Pickup */}
                    <td className="py-4 px-6 text-zinc-300">
                      {b.pickup_date || b.pickup_time ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-white flex items-center space-x-1">
                            <CalendarCheck className="w-3.5 h-3.5 text-taxi-yellow inline mr-1 flex-shrink-0" />
                            <span>{b.pickup_date || 'Today'}</span>
                          </p>
                          <p className="text-[11px] text-taxi-yellow/90 font-mono">
                            {b.pickup_time || 'Immediate'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Immediate / ASAP</span>
                      )}
                    </td>

                    {/* Route Details */}
                    <td className="py-4 px-6 text-zinc-300 max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-start space-x-1.5 text-zinc-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                          <span className="truncate">{b.pickup_location || 'Not provided'}</span>
                        </div>
                        <div className="flex items-start space-x-1.5 text-zinc-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></span>
                          <span className="truncate">{b.destination || 'Not provided'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Driver */}
                    <td className="py-4 px-6">
                      {b.driver_name ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <Car className="w-3.5 h-3.5 text-taxi-yellow flex-shrink-0" />
                            <span className="font-bold text-white text-xs">{b.driver_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex px-2 py-0.5 rounded bg-zinc-900 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold">
                              {b.driver_taxi_registration || 'TAXI'}
                            </span>
                            {b.driver_contact && (
                              <a
                                href={`https://wa.me/${b.driver_contact.replace(/[^\d]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-[#25D366] hover:underline"
                                title="Chat with driver"
                              >
                                {b.driver_contact}
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {b.status === 'CONFIRMED'
                          ? 'CONFIRMED'
                          : b.status === 'COMPLETED'
                          ? 'COMPLETED'
                          : b.status === 'CANCELLED'
                          ? 'CANCELLED'
                          : 'PENDING'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="inline-flex items-center space-x-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-taxi-yellow" />
                        <span>Update & Assign</span>
                      </button>
                      <a
                        href={`https://wa.me/${b.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi ${b.customer_name}, regarding your PB08 TAXI booking (#${b.booking_reference}): `)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-[#25D366] hover:text-white bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2.5 py-1.5 rounded-lg border border-[#25D366]/30 transition-colors"
                        title="Chat with Customer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update & Driver Assignment Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 relative text-white shadow-2xl animate-scale-up my-8">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-taxi-yellow/10 rounded-lg text-taxi-yellow">
                  <CalendarCheck className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-white">Booking Dispatch & Driver Assignment</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Reference: <span className="text-taxi-yellow font-bold font-mono">#{selectedBooking.booking_reference}</span>
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Ride Details Summary Card */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 text-xs space-y-1.5 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer:</span>
                <span className="font-bold text-white">{selectedBooking.customer_name} ({selectedBooking.whatsapp_number})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pickup Date & Time:</span>
                <span className="font-bold text-taxi-yellow">
                  {selectedBooking.pickup_date || 'Today'} at {selectedBooking.pickup_time || 'Immediate'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pickup Location:</span>
                <span className="text-right max-w-[280px] truncate">{selectedBooking.pickup_location || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Destination:</span>
                <span className="text-right max-w-[280px] truncate">{selectedBooking.destination || 'Not provided'}</span>
              </div>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              {/* Status Select Box - Matching screenshot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Booking Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => {
                    const newSt = e.target.value;
                    setEditStatus(newSt);
                    if (newSt === 'CONFIRMED' && !assignDriverEnabled) {
                      handleToggleAssignDriver(true);
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-xs sm:text-sm text-white focus:border-taxi-yellow outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED (Driver Assigned)</option>
                  <option value="COMPLETED">COMPLETED (Ride Finished)</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Assign Driver Toggle Checkbox */}
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-850 rounded-2xl space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={assignDriverEnabled}
                    onChange={(e) => handleToggleAssignDriver(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow accent-taxi-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Assign Driver to this Booking</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Select a verified fleet driver from the list below to handle this pickup.
                    </span>
                  </div>
                </label>

                {/* Driver List with Assign Buttons (Shown when toggle is ticked) */}
                {assignDriverEnabled && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                      <span>Available Drivers ({availableDrivers.length}):</span>
                      {selectedDriverId && (
                        <button
                          type="button"
                          onClick={() => setSelectedDriverId(null)}
                          className="text-amber-400 hover:underline"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    {loadingDrivers ? (
                      <div className="py-4 text-center text-xs text-zinc-500 flex items-center justify-center space-x-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-taxi-yellow" />
                        <span>Loading driver fleet...</span>
                      </div>
                    ) : availableDrivers.length === 0 ? (
                      <div className="p-3 rounded-xl bg-zinc-900 text-center text-xs text-zinc-500">
                        No active drivers available. Please add drivers in the <strong>Drivers</strong> section.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {availableDrivers.map((driver) => {
                          const isAssigned = selectedDriverId === driver.id;
                          return (
                            <div
                              key={driver.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                isAssigned
                                  ? 'bg-taxi-yellow/10 border-taxi-yellow/60 shadow'
                                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isAssigned ? 'bg-taxi-yellow text-black' : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                  {isAssigned ? <Check className="w-4 h-4" /> : <Car className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs">{driver.name}</div>
                                  <div className="flex items-center space-x-2 text-[10px]">
                                    <span className="font-mono text-amber-300 font-bold">{driver.taxi_registration}</span>
                                    <span className="text-zinc-500">•</span>
                                    <span className="text-zinc-400 font-mono">{driver.contact_number}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedDriverId(driver.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                                  isAssigned
                                    ? 'bg-taxi-yellow text-black shadow'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700'
                                }`}
                              >
                                {isAssigned ? 'Assigned ✓' : 'Assign'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Automatic WhatsApp Alert Toggle */}
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendWhatsAppAlert}
                    onChange={(e) => setSendWhatsAppAlert(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow accent-taxi-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block flex items-center space-x-1.5">
                      <Send className="w-3 h-3 text-taxi-yellow" />
                      <span>Send Automated WhatsApp Notifications</span>
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Customer receives template message with driver & taxi details. Driver receives ride duty pickup alert.
                    </span>
                  </div>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Dispatcher Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g., Fare agreed ₹1800, AC Sedan requested"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-taxi-yellow outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  disabled={saving}
                  className="w-1/2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 bg-taxi-yellow hover:bg-yellow-400 text-black font-extrabold py-3 rounded-xl text-xs transition-colors shadow-md shadow-taxi-yellow/20 flex items-center justify-center space-x-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Updating...' : 'Save & Confirm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
