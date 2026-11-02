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
  Settings,
  Globe,
  BarChart3
} from 'lucide-react';
import { getWhatsAppStatus } from '../api/client';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { adminCache } from '../utils/adminCache';
import OpenWAChatModal from './OpenWAChatModal';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'GA4 Analytics (API)', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Drivers', path: '/admin/drivers', icon: Car },
  { label: 'Image Slider', path: '/admin/slider', icon: Sliders },
  { label: 'WhatsApp Settings', path: '/admin/whatsapp', icon: MessageSquare },
  { label: 'WhatsApp Offers', path: '/admin/offers', icon: Send },
  { label: 'Message Logs', path: '/admin/logs', icon: FileText },
  { label: 'Advance SEO', path: '/admin/seo', icon: Globe },
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
      
      {/* Mobile Header with Native Safe Area Auto-Detection */}
      <div 
        className="md:hidden sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between shadow-md transition-all"
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: '0.75rem',
          paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
        }}
      >
        <div className="flex items-center space-x-2.5">
          {settings.site_logo_url ? (
            <img
              src={settings.site_logo_url}
              alt="Logo"
              onError={(e) => {
                if (!e.currentTarget.dataset.triedFallback) {
                  e.currentTarget.dataset.triedFallback = 'true';
                  const filename = (settings.site_logo_url || '').split('/').pop() || 'pb08taxi-logo-1791754759.png';
                  e.currentTarget.src = `https://raw.githubusercontent.com/pb08taxi/PB08TAXI/main/Logo/${filename}`;
                }
              }}
              className="w-8 h-8 object-contain rounded-lg bg-zinc-900/60 p-0.5 border border-zinc-800"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-taxi-yellow flex items-center justify-center text-black font-black">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          <span className="font-black text-lg text-white">
            {settings.brand_title || 'PB08 TAXI'}{' '}
            <span className="text-taxi-yellow text-xs font-bold uppercase tracking-wider ml-1">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-zinc-400 hover:text-white p-2 rounded-xl border border-zinc-800 bg-zinc-900/60 active:scale-95 transition-all cursor-pointer"
          aria-label={sidebarOpen ? "Close admin menu" : "Open admin menu"}
        >
          {sidebarOpen ? <X className="w-5 h-5 text-taxi-yellow" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm animate-fade-in transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation with Safe Area Support */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-72 max-w-[85vw] md:w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        }}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Brand Logo & Close in Sidebar */}
          <div className="p-5 sm:p-6 border-b border-zinc-850 flex items-center justify-between shrink-0">
            <Link to="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center space-x-3 min-w-0">
              {settings.site_logo_url ? (
                <img
                  src={settings.site_logo_url}
                  alt="Logo"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.triedFallback) {
                      e.currentTarget.dataset.triedFallback = 'true';
                      const filename = (settings.site_logo_url || '').split('/').pop() || 'pb08taxi-logo-1791754759.png';
                      e.currentTarget.src = `https://raw.githubusercontent.com/pb08taxi/PB08TAXI/main/Logo/${filename}`;
                    }
                  }}
                  className="w-10 h-10 object-contain rounded-xl bg-zinc-900/60 p-1 border border-zinc-800 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-taxi-yellow flex items-center justify-center text-black shadow-md shadow-taxi-yellow/20 flex-shrink-0">
                  <Car className="w-6 h-6 stroke-[2.5]" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-lg font-black text-white leading-tight truncate">{settings.brand_title || 'PB08 TAXI'}</div>
                <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Control Panel</div>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* WhatsApp Live Status Pill */}
          <div className="px-5 sm:px-6 py-3 border-b border-zinc-900 bg-zinc-900/40 shrink-0">
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

          {/* Navigation Links with smooth scroll */}
          <nav className="p-3 sm:p-4 space-y-1.5 overflow-y-auto flex-1">
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

        {/* Footer Actions with Safe Area Bottom Padding */}
        <div 
          className="p-4 border-t border-zinc-900 space-y-2 shrink-0 bg-zinc-950"
          style={{
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-zinc-400 hover:text-taxi-yellow px-4 py-2.5 rounded-xl transition-colors font-medium bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 px-4 py-2.5 rounded-xl transition-colors border border-red-900/40 cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout ({adminUser})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Safe Area Padding */}
      <main 
        className="flex-1 bg-black min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-hidden"
        style={{
          paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
        }}
      >
        <div className="max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>

      {/* Global OpenWA Direct Chat Box Popup */}
      <OpenWAChatModal />

    </div>
  );
}
