import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, CheckCircle2, AlertCircle, Clock, Filter } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getWhatsAppLogs } from '../api/client';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getWhatsAppLogs(100, typeFilter);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load message logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [typeFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">WhatsApp Message Logs</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Audit log of all booking confirmations, promotional offers, and test messages dispatched via OpenWA.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-850 p-4 rounded-2xl">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-bold text-zinc-300">Filter by Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl py-1.5 px-3 outline-none focus:border-taxi-yellow"
          >
            <option value="">All Message Types</option>
            <option value="BOOKING_CONFIRMATION">Booking Confirmations</option>
            <option value="PROMOTIONAL_OFFER">Promotional Offers</option>
            <option value="TEST_MESSAGE">Test Messages</option>
          </select>
        </div>

        {/* Logs Table */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-taxi-yellow" />
              <h2 className="text-base font-bold text-white">
                Message History ({logs.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-400">Latest 100 entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40 border-b border-zinc-850">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Recipient Phone</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Message Content</th>
                  <th className="py-3.5 px-6">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      Loading message audit history...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No message logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6 text-zinc-400 font-mono whitespace-nowrap">
                        {new Date(log.sent_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {log.phone}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-md text-[10px] font-semibold border border-zinc-800">
                          {log.message_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <p className="text-xs text-zinc-200 line-clamp-2">{log.content}</p>
                        {log.error_detail && (
                          <p className="text-[10px] text-red-400 font-mono mt-1 line-clamp-1">
                            Error: {log.error_detail}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          log.status === 'SENT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {log.status === 'SENT' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
