import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import FloatingCenterToast from '../components/FloatingCenterToast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(({ message, type = 'success', title = '', duration = 3500 }) => {
    setToast({
      id: Date.now(),
      message,
      type,
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Action Failed' : 'Notice'),
      duration,
    });
  }, []);

  const showSuccess = useCallback((message, title = '', duration = 3500) => {
    showToast({ message, type: 'success', title, duration });
  }, [showToast]);

  const showError = useCallback((message, title = '', duration = 4000) => {
    showToast({ message, type: 'error', title, duration });
  }, [showToast]);

  const showInfo = useCallback((message, title = '', duration = 3500) => {
    showToast({ message, type: 'info', title, duration });
  }, [showToast]);

  // Expose global window helper so any non-react utility can also trigger centered toasts
  useEffect(() => {
    window.showToast = showToast;
    window.toast = {
      success: showSuccess,
      error: showError,
      info: showInfo,
      hide: hideToast,
    };
    return () => {
      delete window.showToast;
      delete window.toast;
    };
  }, [showToast, showSuccess, showError, showInfo, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, hideToast }}>
      {children}
      {toast && <FloatingCenterToast toast={toast} onClose={hideToast} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if invoked outside provider
    return {
      showToast: (args) => window.showToast?.(args),
      showSuccess: (msg, title) => window.toast?.success(msg, title),
      showError: (msg, title) => window.toast?.error(msg, title),
      showInfo: (msg, title) => window.toast?.info(msg, title),
      hideToast: () => window.toast?.hide(),
    };
  }
  return ctx;
}

export default ToastContext;
