import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSiteSettings } from '../api/client';

const DEFAULT_SETTINGS = {
  support_phone: "+91 98765 43210",
  whatsapp_number: "919876543210",
  site_logo_url: null,
  site_favicon_url: null,
  show_credentials_hint: false,
};

const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const applyFavicon = (faviconUrl) => {
    if (!faviconUrl) return;
    try {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    } catch (e) {
      console.warn("Could not update favicon:", e);
    }
  };

  const refreshSettings = useCallback(async () => {
    try {
      const data = await getPublicSiteSettings();
      if (data) {
        setSettings(data);
        if (data.site_favicon_url) {
          applyFavicon(data.site_favicon_url);
        }
      }
    } catch (err) {
      console.warn("Using default site settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
