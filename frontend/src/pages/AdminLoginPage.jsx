import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, User, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../api/client';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminLogin(username.trim(), password.trim());
      localStorage.setItem('pb08_admin_token', res.access_token);
      localStorage.setItem('pb08_admin_user', res.username || username);
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid admin credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 relative selection:bg-taxi-yellow selection:text-black">
      
      {/* Background taxi pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      {/* Return to website */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-zinc-400 hover:text-taxi-yellow text-sm font-semibold transition-colors bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to PB08 TAXI</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
        
        {/* Top Checker Pattern Accent */}
        <div className="absolute top-0 left-12 right-12 h-1.5 taxi-checker rounded-t-full" />

        <div className="text-center mb-8 space-y-3">
          {settings?.site_logo_url ? (
            <div className="flex items-center justify-center mx-auto">
              <img
                src={settings.site_logo_url}
                alt="PB08 TAXI"
                onError={(e) => {
                  if (!e.currentTarget.dataset.triedFallback) {
                    e.currentTarget.dataset.triedFallback = 'true';
                    const filename = (settings.site_logo_url || '').split('/').pop() || 'pb08taxi-logo-1791754759.png';
                    e.currentTarget.src = `https://raw.githubusercontent.com/pb08taxi/PB08TAXI/main/Logo/${filename}`;
                  }
                }}
                className="max-h-16 max-w-[200px] object-contain rounded-xl p-1 bg-zinc-900 border border-zinc-800"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-taxi-yellow flex items-center justify-center text-black mx-auto shadow-lg shadow-taxi-yellow/20">
              <Car className="w-8 h-8 stroke-[2.5]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black text-white">PB08 TAXI Control Panel</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Sign in with your administrator credentials
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-taxi-yellow transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-taxi-yellow hover:bg-taxi-yellowHover disabled:opacity-60 text-black font-black text-sm py-3.5 rounded-xl shadow-lg shadow-taxi-yellow/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In to Admin Panel</span>
            )}
          </button>

        </form>

        {settings?.show_credentials_hint && (
          <div className="mt-8 pt-6 border-t border-zinc-900 text-center animate-fadeIn">
            <p className="text-[11px] text-zinc-500">
              Default credentials: <code className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded font-mono">admin</code> / <code className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded font-mono">PB08Taxi@2026!</code>
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
