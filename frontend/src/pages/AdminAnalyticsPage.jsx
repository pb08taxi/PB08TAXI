import React from 'react';
import AdminVisitorAnalytics from '../components/AdminVisitorAnalytics';
import { BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-taxi-yellow text-xs font-black uppercase tracking-widest mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>360° Omnichannel Traffic &amp; Performance</span>
          </div>
          <h1 className="text-3xl font-black text-white">Analytics Hub &amp; Google Looker Studio</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Dual analytics engine: Real-time in-house visitor activity + Official Google Analytics 4 Looker Studio reports.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-300 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-taxi-yellow" />
            <span>In-House: <strong>Active</strong></span>
          </div>
          <div className="bg-blue-950/60 border border-blue-900 px-3 py-1.5 rounded-xl text-blue-300 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>GA4: <strong>G-MD0W9GNM7V</strong></span>
          </div>
        </div>
      </div>

      {/* Main Dual Analytics Engine */}
      <AdminVisitorAnalytics />
    </div>
  );
}
