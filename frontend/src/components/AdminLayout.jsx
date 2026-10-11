import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Sliders, 
  MessageSquare, 
  Send, 
  FileText, 
  LogOut, 
  Car, 
  Menu, 
  X, 
  ExternalLink, 
  Radio, 
  Settings 
} from 'lucide-react';
import { getWhatsAppStatus } from '../api/client';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { adminCache } from '../utils/adminCache';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Drivers', path: '/admin/drivers', icon: Car },
  { label: 'Image Slider', path: '/admin/slider', icon: Sliders },
  { label: 'WhatsApp Settings', path: '/admin/whatsapp', icon: MessageSquare },
  { label: 'WhatsApp Offers', path: '/admin/offers', icon: Send },
  { label: 'Message Logs', path: '/admin/logs', icon: FileText },
  { label: 'Site Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [waStatus, setWaStatus] = useState({ connected: false, status: 'loading' });
  const { settings } = useSiteSettings();

  const adminUser = localStorage.getItem('pb08_admin_user') || 'Admin';

  useEffect(() => {
    // Quick polling of WhatsApp connection status
    const checkStatus = () => {
      getWhatsAppStatus()
        .then(setWaStatus)
        .catch(() => setWaStatus({ connected: false, status: 'offline' }));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    adminCache.clear();
    localStorage.removeItem('pb08_admin_token');
    localStorage.removeItem('pb08_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {settings.site_logo_url ? (
            <img src={settings.site_logo_url} alt="Logo" className="w-8 h-8 object-contain rounded-lg bg-zinc-900/60 p-0.5 border border-zinc-800" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-taxi-yellow flex items-center justify-center text-black font-black">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          <span className="font-black text-lg text-white">{settings.brand_title || 'PB08 TAXI'} <span className="text-taxi-yellow text-xs font-bold uppercase tracking-wider ml-1">Admin</span></span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-zinc-400 p-1.5 rounded-lg border border-zinc-800"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Logo in Sidebar */}
          <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-3">
              {settings.site_logo_url ? (
                <img src={settings.site_logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-xl bg-zinc-900/60 p-1 border border-zinc-800 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-taxi-yellow flex items-center justify-center text-black shadow-md shadow-taxi-yellow/20 flex-shrink-0">
                  <Car className="w-6 h-6 stroke-[2.5]" />
                </div>
              )}
              <div>
                <div className="text-lg font-black text-white leading-tight">{settings.brand_title || 'PB08 TAXI'}</div>
                <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Control Panel</div>
              </div>
            </Link>
          </div>

          {/* WhatsApp Live Status Pill */}
          <div className="px-6 py-3 border-b border-zinc-900 bg-zinc-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center space-x-1.5 font-medium">
                <Radio className={`w-3.5 h-3.5 ${waStatus.connected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                <span>WhatsApp:</span>
              </span>
              <span className={`font-bold text-[11px] px-2 py-0.5 rounded-full ${
                waStatus.connected 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {waStatus.connected ? 'Connected' : (waStatus.status || 'Offline')}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-taxi-yellow text-black shadow-md shadow-taxi-yellow/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-900 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-zinc-400 hover:text-taxi-yellow px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 px-4 py-2.5 rounded-xl transition-colors border border-red-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout ({adminUser})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-black min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>

    </div>
  );
}
