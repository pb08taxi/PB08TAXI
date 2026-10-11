import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  Car
} from 'lucide-react';
import { getAdminStats, getBookings } from '../api/client';
import { useAdminQuery } from '../utils/adminCache';

export default function AdminDashboardPage() {
  const fetchDashboardData = async () => {
    const [statsData, bookingsData] = await Promise.all([
      getAdminStats(),
      getBookings('', '')
    ]);
    return {
      stats: statsData,
      recentBookings: bookingsData.slice(0, 5)
    };
  };

  const { data, loading, isRevalidating, refresh } = useAdminQuery('admin_dashboard', fetchDashboardData, {
    ttl: 3 * 60 * 1000
  });

  const stats = data?.stats;
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Real-time taxi operations, customer records, and WhatsApp delivery performance.
            </p>
          </div>
          <button
            onClick={() => refresh()}
            disabled={loading || isRevalidating}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Updating...' : 'Refresh Metrics'}</span>
          </button>
        </div>

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Customers */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden group hover:border-taxi-yellow/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Customers</span>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-taxi-yellow flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {loading ? '—' : (stats?.total_customers ?? 0)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Deduplicated in Neon PostgreSQL</p>
          </div>

          {/* Card 2: Total Bookings */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden group hover:border-taxi-yellow/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Bookings</span>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-taxi-yellow flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {loading ? '—' : (stats?.total_bookings ?? 0)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">All-time reservation volume</p>
          </div>

          {/* Card 3: Today's Bookings */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden group hover:border-taxi-yellow/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Today's Bookings</span>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-taxi-yellow flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-taxi-yellow">
              {loading ? '—' : (stats?.today_bookings ?? 0)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              Pending confirmation: <span className="text-amber-400 font-bold">{stats?.pending_bookings ?? 0}</span>
            </p>
          </div>

          {/* Card 4: WhatsApp Audit */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden group hover:border-taxi-yellow/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">WhatsApp Dispatch</span>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white flex items-baseline space-x-2">
              <span>{loading ? '—' : (stats?.whatsapp_sent_count ?? 0)}</span>
              <span className="text-xs text-zinc-500 font-medium">sent</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              Failed/Offline: <span className="text-rose-400 font-bold">{stats?.whatsapp_failed_count ?? 0}</span>
            </p>
          </div>

        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link
            to="/admin/offers"
            className="bg-zinc-950 border border-zinc-850 hover:border-taxi-yellow/50 rounded-2xl p-5 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow/15 text-taxi-yellow flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-taxi-yellow transition-colors">
                  Send WhatsApp Offer
                </h3>
                <p className="text-xs text-zinc-400">
                  {stats?.eligible_offers_count ?? 0} consented customers ready
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-taxi-yellow group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/slider"
            className="bg-zinc-950 border border-zinc-850 hover:border-taxi-yellow/50 rounded-2xl p-5 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-taxi-yellow/15 text-taxi-yellow flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-taxi-yellow transition-colors">
                  Update Homepage Slider
                </h3>
                <p className="text-xs text-zinc-400">Upload, change or reorder slides</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-taxi-yellow group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/whatsapp"
            className="bg-zinc-950 border border-zinc-850 hover:border-taxi-yellow/50 rounded-2xl p-5 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  WhatsApp Connection
                </h3>
                <p className="text-xs text-zinc-400">OpenWA QR scan & gateway status</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

        </div>

        {/* Recent Bookings Quick Table */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Recent Customer Bookings</h2>
              <p className="text-xs text-zinc-400">Latest ride requests submitted through the website</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-bold text-taxi-yellow hover:underline flex items-center space-x-1"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-850">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No bookings recorded yet. Submit a test ride on the homepage!
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-taxi-yellow">
                        {b.booking_reference}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {b.customer_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {b.whatsapp_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-zinc-200">{b.pickup_location || 'Not specified'}</span>
                        <span className="text-zinc-500 mx-1.5">➔</span>
                        <span className="text-zinc-200">{b.destination || 'Not specified'}</span>
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-right text-zinc-500 font-mono">
                        {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
