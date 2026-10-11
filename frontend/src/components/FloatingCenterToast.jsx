import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function FloatingCenterToast({ toast, onClose }) {
  if (!toast) return null;

  const {
    type = 'success',
    title,
    message = '',
    duration = 3500
  } = toast;

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toast, duration, onClose]);

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isInfo = type === 'info';

  const themeConfig = {
    success: {
      cardBorder: 'border-emerald-500/40',
      glow: 'shadow-[0_0_60px_rgba(16,185,129,0.3)]',
      iconBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      iconShadow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]',
      barColor: 'bg-emerald-400',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      defaultTitle: 'Success!',
      Icon: CheckCircle2,
    },
    error: {
      cardBorder: 'border-red-500/40',
      glow: 'shadow-[0_0_60px_rgba(239,68,68,0.3)]',
      iconBg: 'bg-red-500/15 border-red-500/40 text-red-400',
      iconShadow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]',
      barColor: 'bg-red-400',
      btnBg: 'bg-red-500 hover:bg-red-400 text-white',
      defaultTitle: 'Action Failed',
      Icon: AlertCircle,
    },
    info: {
      cardBorder: 'border-amber-500/40',
      glow: 'shadow-[0_0_60px_rgba(245,158,11,0.3)]',
      iconBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      iconShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]',
      barColor: 'bg-amber-400',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-black',
      defaultTitle: 'Notice',
      Icon: Info,
    }
  };

  const theme = themeConfig[type] || themeConfig.success;
  const CurrentIcon = theme.Icon;
  const displayTitle = title || theme.defaultTitle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300"
    >
      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes toastPopIn {
          0% { opacity: 0; transform: scale(0.85) translateY(12px); }
          60% { opacity: 1; transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Dimmed Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />

      {/* Centered Floating Notification Card */}
      <div
        style={{ animation: 'toastPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        className={`relative w-full max-w-md bg-zinc-950/95 border ${theme.cardBorder} ${theme.glow} rounded-3xl p-6 sm:p-8 text-center text-white z-10 overflow-hidden shadow-2xl backdrop-blur-xl`}
      >
        {/* Top subtle taxi-style accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Top-Right Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-850 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Glowing Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 ${theme.iconBg} ${theme.iconShadow} flex items-center justify-center transition-transform hover:scale-105`}
          >
            <CurrentIcon className="w-9 h-9 sm:w-10 sm:h-10 stroke-[2.5]" />
          </div>
        </div>

        {/* Header Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {displayTitle}
        </h3>

        {/* Main Message Body */}
        <p className="mt-2 text-sm sm:text-base text-zinc-300 font-medium leading-relaxed whitespace-pre-line px-2">
          {message}
        </p>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className={`${theme.btnBg} font-black text-xs sm:text-sm px-8 py-3 rounded-xl shadow-lg transition-all transform active:scale-95 hover:scale-105 tracking-wider uppercase`}
          >
            {isSuccess ? 'Dismiss' : isError ? 'Close' : 'Got It'}
          </button>
        </div>

        {/* Auto Dismiss Countdown Bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/60 overflow-hidden">
            <div
              style={{
                animation: `toastShrink ${duration}ms linear forwards`,
              }}
              className={`h-full ${theme.barColor}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
