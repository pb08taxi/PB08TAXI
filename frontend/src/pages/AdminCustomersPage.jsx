import React, { useState, useEffect } from 'react';
import { Search, Users, Phone, Calendar, MessageCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { getCustomers, updateCustomerConsent } from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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

  const handleToggleConsent = async (customer) => {
    try {
      const newStatus = !customer.marketing_consent;
      await updateCustomerConsent(customer.id, newStatus);
      mutate((prev) =>
        prev ? prev.map((c) => (c.id === customer.id ? { ...c, marketing_consent: newStatus } : c)) : []
      );
      adminCache.invalidate('admin_dashboard');
    } catch (err) {
      alert("Failed to update consent status.");
    }
  };

  return (
    <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Customer Directory</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Persistent customer profiles stored in Neon.tech PostgreSQL (auto-deduplicated by WhatsApp number).
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
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-taxi-yellow" />
              <h2 className="text-base font-bold text-white">
                All Customers ({customers.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              {customers.filter(c => c.marketing_consent).length} opted in for promotional WhatsApp
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
                      Loading customer records...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No matching customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-white text-sm">
                        {c.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-300">
                        {c.whatsapp_number}
                      </td>
                      <td className="py-4 px-6 text-zinc-400">
                        {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        <span className="bg-zinc-900 text-taxi-yellow px-3 py-1 rounded-full border border-zinc-800">
                          {c.total_bookings} {c.total_bookings === 1 ? 'ride' : 'rides'}
                        </span>
                      </td>
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
                      <td className="py-4 px-6 text-right">
                        <a
                          href={`https://wa.me/${c.whatsapp_number.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs text-[#25D366] hover:text-white bg-[#25D366]/10 hover:bg-[#25D366]/20 px-3 py-1.5 rounded-lg border border-[#25D366]/30 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
  );
}
