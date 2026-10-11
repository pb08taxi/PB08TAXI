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
  AlertCircle
} from 'lucide-react';
import { getBookings, updateBookingStatus } from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Status edit modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editStatus, setEditStatus] = useState('PENDING');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditNotes(booking.notes || '');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const updated = await updateBookingStatus(selectedBooking.id, editStatus, editNotes);
      mutate((prev) =>
        prev ? prev.map((b) => (b.id === updated.id ? updated : b)) : [updated]
      );
      // Invalidate dashboard metrics cache so stats reflect status change
      adminCache.invalidate('admin_dashboard');
      setSelectedBooking(null);
    } catch (err) {
      alert("Failed to update booking status.");
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
              View customer reservations, route details, and update dispatch status.
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
                {tab}
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
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden">
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
                  <th className="py-3.5 px-6">WhatsApp Number</th>
                  <th className="py-3.5 px-6">Scheduled Pickup</th>
                  <th className="py-3.5 px-6">Pickup Location</th>
                  <th className="py-3.5 px-6">Destination</th>
                  <th className="py-3.5 px-6">Booking Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {loading && bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      No bookings found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-taxi-yellow">
                        {b.booking_reference}
                      </td>
                      <td className="py-4 px-6 font-bold text-white text-sm">
                        {b.customer_name}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-300">
                        {b.whatsapp_number}
                      </td>
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
                      <td className="py-4 px-6 text-zinc-300">
                        {b.pickup_location || <span className="text-zinc-600 italic">Not provided</span>}
                      </td>
                      <td className="py-4 px-6 text-zinc-300">
                        {b.destination || <span className="text-zinc-600 italic">Not provided</span>}
                      </td>
                      <td className="py-4 px-6 text-zinc-400 whitespace-nowrap">
                        {new Date(b.created_at).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : b.status === 'CANCELLED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="inline-flex items-center space-x-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-taxi-yellow" />
                          <span>Update</span>
                        </button>
                        <a
                          href={`https://wa.me/${b.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi ${b.customer_name}, regarding your PB08 TAXI booking (${b.booking_reference}): `)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-[#25D366] hover:text-white bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2.5 py-1.5 rounded-lg border border-[#25D366]/30 transition-colors"
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

        {/* Status Update Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative text-white">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Update Booking Status</h3>
                <p className="text-xs text-zinc-400">
                  Reference: <span className="text-taxi-yellow font-bold font-mono">{selectedBooking.booking_reference}</span>
                </p>
              </div>

              <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-850 text-xs space-y-1 text-zinc-300">
                <p><span className="text-zinc-500">Customer:</span> {selectedBooking.customer_name} ({selectedBooking.whatsapp_number})</p>
                {(selectedBooking.pickup_date || selectedBooking.pickup_time) && (
                  <p><span className="text-zinc-500">Scheduled:</span> <strong className="text-taxi-yellow">{selectedBooking.pickup_date || 'Today'} at {selectedBooking.pickup_time || 'Immediate'}</strong></p>
                )}
                <p><span className="text-zinc-500">Pickup:</span> {selectedBooking.pickup_location || 'Not provided'}</p>
                <p><span className="text-zinc-500">Destination:</span> {selectedBooking.destination || 'Not provided'}</p>
              </div>

              <form onSubmit={handleSaveStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    Booking Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-taxi-yellow outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED (Driver Assigned)</option>
                    <option value="COMPLETED">COMPLETED (Ride Finished)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    Dispatcher Notes / Driver Info
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g., Driver Gurmeet Singh assigned, Swift Dzire PB08-AB-1234, fare agreed ₹1800"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-taxi-yellow outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="w-1/2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold py-3 rounded-xl text-xs transition-colors shadow-md"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
  );
}
