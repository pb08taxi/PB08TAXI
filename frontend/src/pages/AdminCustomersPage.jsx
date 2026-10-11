import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Phone, 
  Calendar, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  updateCustomerConsent 
} from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    marketing_consent: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Modal
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryKey = `admin_customers_${debouncedSearch.trim().toLowerCase()}`;
  const { data, loading, isRevalidating, refresh, mutate } = useAdminQuery(
    queryKey,
    () => getCustomers(debouncedSearch),
    { ttl: 2 * 60 * 1000 }
  );

  const customers = data || [];

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      whatsapp_number: '',
      marketing_consent: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      whatsapp_number: customer.whatsapp_number || '',
      marketing_consent: customer.marketing_consent ?? true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!formData.whatsapp_number.trim()) {
      setFormError('Customer WhatsApp / phone number is required.');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        whatsapp_number: formData.whatsapp_number.trim(),
        marketing_consent: Boolean(formData.marketing_consent),
      };

      if (editingCustomer) {
        const updated = await updateCustomer(editingCustomer.id, payload);
        mutate((prev) =>
          prev ? prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...updated } : c)) : []
        );
      } else {
        const created = await createCustomer(payload);
        mutate((prev) => (prev ? [created, ...prev] : [created]));
      }

      adminCache.invalidate('admin_customers');
      adminCache.invalidate('admin_dashboard');
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save customer. Please check the phone number.';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleConsent = async (customer) => {
    try {
      const newStatus = !customer.marketing_consent;
      await updateCustomerConsent(customer.id, newStatus);
      mutate((prev) =>
        prev ? prev.map((c) => (c.id === customer.id ? { ...c, marketing_consent: newStatus } : c)) : []
      );
      adminCache.invalidate('admin_dashboard');
    } catch (err) {
      alert('Failed to update consent status.');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    try {
      setDeleteSubmitting(true);
      await deleteCustomer(deletingCustomer.id);
      mutate((prev) => (prev ? prev.filter((c) => c.id !== deletingCustomer.id) : []));
      adminCache.invalidate('admin_customers');
      adminCache.invalidate('admin_dashboard');
      setDeletingCustomer(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete customer.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-white">Customer Directory</h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Persistent customer profiles stored in Neon PostgreSQL (auto-deduplicated by phone number).
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => refresh()}
            disabled={loading || isRevalidating}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Updating...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 bg-taxi-yellow hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-taxi-yellow/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 flex items-center space-x-3">
        <Search className="w-5 h-5 text-zinc-500 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers by name or WhatsApp number (e.g., Harpreet, 9876543210)..."
          className="w-full bg-transparent border-none text-sm text-white placeholder-zinc-500 outline-none"
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

      {/* Customer Table */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-taxi-yellow" />
            <h2 className="text-base font-bold text-white">
              All Customers ({customers.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {customers.filter((c) => c.marketing_consent).length} opted in for promotional WhatsApp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40 border-b border-zinc-850">
              <tr>
                <th className="py-3.5 px-6">Customer Name</th>
                <th className="py-3.5 px-6">WhatsApp Number</th>
                <th className="py-3.5 px-6">Date Added</th>
                <th className="py-3.5 px-6 text-center">Total Bookings</th>
                <th className="py-3.5 px-6 text-center">Marketing Consent</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-taxi-yellow" />
                      <span>Loading customer records...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-zinc-700" />
                      <p className="text-sm font-semibold text-zinc-400">No matching customers found</p>
                      <p className="text-xs text-zinc-600">Click "Add Customer" to manually register a new customer profile.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Customer Name */}
                    <td className="py-4 px-6 font-bold text-white text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-extrabold text-xs uppercase flex-shrink-0">
                          {c.name ? c.name.substring(0, 2) : 'CU'}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>

                    {/* WhatsApp Phone */}
                    <td className="py-4 px-6 font-mono text-zinc-300">
                      {c.whatsapp_number}
                    </td>

                    {/* Date Added */}
                    <td className="py-4 px-6 text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Total Bookings */}
                    <td className="py-4 px-6 text-center font-bold">
                      <span className="bg-zinc-900 text-taxi-yellow px-3 py-1 rounded-full border border-zinc-800">
                        {c.total_bookings} {c.total_bookings === 1 ? 'ride' : 'rides'}
                      </span>
                    </td>

                    {/* Marketing Consent */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleConsent(c)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                          c.marketing_consent
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Click to toggle consent status"
                      >
                        {c.marketing_consent ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>CONSENTED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-500" />
                            <span>OPTED OUT</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit, Delete, Chat */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        {/* Direct WhatsApp Chat */}
                        <a
                          href={`https://wa.me/${c.whatsapp_number.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-[#25D366] hover:text-white bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2.5 py-1.5 rounded-lg border border-[#25D366]/30 transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </a>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                          title="Edit customer details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingCustomer(c)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 transition-colors"
                          title="Delete customer"
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
                  <UserPlus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {editingCustomer ? 'Update customer profile and consent' : 'Manually register a customer for bookings and offers'}
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

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Customer Name <span className="text-taxi-yellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gurpreet Kaur"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-taxi-yellow transition-colors"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  WhatsApp Number <span className="text-taxi-yellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="e.g. 916284198290 or 9876543210"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-taxi-yellow transition-colors"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Enter 10-digit mobile number or full country code format (e.g., 919876543210).
                </p>
              </div>

              {/* Marketing Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer select-none bg-zinc-900/60 border border-zinc-850 p-3 rounded-xl hover:bg-zinc-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow focus:ring-offset-zinc-950 accent-taxi-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">WhatsApp Marketing Consent</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Permits sending broadcast discount offers and festive ride deals to this customer.
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
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
                  <span>{editingCustomer ? 'Save Changes' : 'Add Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-red-900/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Delete Customer?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to delete customer <span className="text-white font-bold">{deletingCustomer.name}</span> ({deletingCustomer.whatsapp_number})?
                This will also remove their associated ride logs.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-colors flex items-center space-x-2"
              >
                {deleteSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
