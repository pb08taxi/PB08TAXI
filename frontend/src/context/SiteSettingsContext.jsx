import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSiteSettings } from '../api/client';

export const SETTINGS_STORAGE_KEY = 'pb08_site_settings_cache';

const DEFAULT_SETTINGS = {
  support_phone: "+919888079736",
  whatsapp_number: "+919888079736",
  site_logo_url: null,
  site_favicon_url: null,
  site_logo_size: 48,
  brand_title: "PB08 TAXI",
  brand_tagline: "Fast • Safe • Reliable",
  show_credentials_hint: false,
  booking_modal_animation: "golden-glow",
  slider_transition_effect: "fade",
  slider_fade_duration: 1000,
  slider_autoplay_interval: 5500,
  slider_overlay_opacity: 55,
  slider_overlay_color: "#000000",
  social_facebook: "https://facebook.com/pb08taxi",
  social_instagram: "https://instagram.com/pb08taxi",
  social_twitter: "https://twitter.com/pb08taxi",
  social_youtube: "https://youtube.com/@pb08taxi",
};

function getInitialSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Failed to parse cached site settings:", e);
  }
  return DEFAULT_SETTINGS;
}

const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refreshSettings: async () => {},
  updateLocalSettings: () => {},
});

export function SiteSettingsProvider({ children }) {
  // Synchronously initialize from localStorage cache to eliminate any refresh flicker!
  const [settings, setSettings] = useState(() => getInitialSettings());
  const [loading, setLoading] = useState(false);

  const applyFavicon = useCallback((faviconUrl) => {
    if (!faviconUrl) return;
    try {
      let link = document.querySelector("link[rel~='icon']") || document.getElementById('app-favicon');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.id = 'app-favicon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      if (link.href !== faviconUrl) {
        link.href = faviconUrl;
      }
    } catch (e) {
      console.warn("Could not update favicon:", e);
    }
  }, []);

  const applyAppIcons = useCallback((logoUrl) => {
    if (!logoUrl) return;
    try {
      const appleIcons = document.querySelectorAll("link[rel='apple-touch-icon']");
      appleIcons.forEach((el) => {
        el.href = logoUrl;
      });
    } catch (e) {
      console.warn("Could not update apple touch icon:", e);
    }
  }, []);

  // Synchronously ensure favicon and app icons are set if cached on initial mount
  useEffect(() => {
    if (settings.site_favicon_url) {
      applyFavicon(settings.site_favicon_url);
    }
    const icon = settings.site_logo_url || settings.site_favicon_url;
    if (icon) {
      applyAppIcons(icon);
    }
  }, [settings.site_favicon_url, settings.site_logo_url, applyFavicon, applyAppIcons]);

  // Method to immediately update settings in memory and localStorage (zero latency)
  const updateLocalSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn("Could not write site settings to localStorage:", e);
      }
      if (merged.site_favicon_url) {
        applyFavicon(merged.site_favicon_url);
      }
      if (merged.site_logo_url || merged.site_favicon_url) {
        applyAppIcons(merged.site_logo_url || merged.site_favicon_url);
      }
      return merged;
    });
  }, [applyFavicon, applyAppIcons]);

  // Background revalidation with server
  const refreshSettings = useCallback(async () => {
    try {
      const data = await getPublicSiteSettings();
      if (data) {
        setSettings((prev) => {
          const merged = { ...prev, ...data };
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {
            console.warn("Could not update localStorage settings:", e);
          }
          if (merged.site_favicon_url) {
            applyFavicon(merged.site_favicon_url);
          }
          if (merged.site_logo_url || merged.site_favicon_url) {
            applyAppIcons(merged.site_logo_url || merged.site_favicon_url);
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn("Using cached site settings:", err);
    } finally {
      setLoading(false);
    }
  }, [applyFavicon, applyAppIcons]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings, updateLocalSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
