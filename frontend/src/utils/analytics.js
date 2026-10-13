import { trackVisitorEvent } from '../api/client';

// Generate or retrieve persistent anonymous visitor ID
export const getVisitorId = () => {
  try {
    let vid = localStorage.getItem('pb08_visitor_id');
    if (!vid) {
      vid = 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('pb08_visitor_id', vid);
    }
    return vid;
  } catch (e) {
    return 'vis_anonymous_' + Math.random().toString(36).substring(2, 7);
  }
};

// Detect device type
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'Mobile';
  const ua = (navigator.userAgent || '').toLowerCase();
  const width = window.innerWidth;

  if (/ipad|tablet/.test(ua) || (width >= 768 && width <= 1024 && 'ontouchstart' in window)) {
    return 'Tablet';
  }
  if (/mobile|android|iphone|ipod/.test(ua) || width < 768) {
    return 'Mobile';
  }
  return 'Desktop';
};

// Detect browser
export const getBrowserName = () => {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome') && !ua.includes('opr')) return 'Chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('opr') || ua.includes('opera')) return 'Opera';
  return 'Browser';
};

// Track any custom event safely
export const trackEvent = (eventType, eventLabel = null, pagePath = null) => {
  try {
    const payload = {
      visitor_id: getVisitorId(),
      event_type: eventType,
      event_label: eventLabel || undefined,
      page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/'),
      device_type: getDeviceType(),
      browser: getBrowserName(),
    };

    // Use non-blocking tracking
    trackVisitorEvent(payload);
  } catch (err) {
    // Analytics failure should never break UI
  }
};

// High-level convenience trackers
let lastPageViewTime = 0;
export const trackPageView = (path) => {
  const now = Date.now();
  // Prevent duplicate double fires within 1 second
  if (now - lastPageViewTime < 1000) return;
  lastPageViewTime = now;
  trackEvent('pageview', 'Website Open', path);
};

export const trackCallClick = (label = 'Helpline Call') => {
  trackEvent('click_call', label);
};

export const trackWhatsAppClick = (label = 'WhatsApp Chat') => {
  trackEvent('click_whatsapp', label);
};

export const trackBookRideClick = (label = 'Book Ride Button') => {
  trackEvent('click_book_ride', label);
};

export const trackModalOpen = (label = 'Booking Modal Opened') => {
  trackEvent('open_booking_modal', label);
};

export const trackBookingSubmitted = (route = 'Ride Confirmed') => {
  trackEvent('submit_booking', route);
};

export const trackRouteClick = (routeName) => {
  trackEvent('click_route', routeName);
};
