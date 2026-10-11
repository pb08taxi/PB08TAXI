import React, { useEffect } from 'react';
import { getPublicSEOSettings } from '../api/client';

export default function SEOHead() {
  useEffect(() => {
    const applySEOSettings = (seo) => {
      if (!seo) return;

      // 1. Title
      if (seo.meta_title) {
        document.title = seo.meta_title;
      }

      // Helper function to set or create meta tag
      const setMeta = (attribute, name, content) => {
        if (!content) return;
        let el = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attribute, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      // 2. Standard Meta Tags
      setMeta('name', 'description', seo.meta_description);
      setMeta('name', 'keywords', seo.meta_keywords);
      setMeta('name', 'robots', seo.robots_directive);

      // 3. Punjab Local Geo Tags
      setMeta('name', 'geo.region', seo.geo_region);
      setMeta('name', 'geo.placename', seo.geo_placename);
      if (seo.geo_latitude && seo.geo_longitude) {
        const coords = `${seo.geo_latitude};${seo.geo_longitude}`;
        setMeta('name', 'geo.position', coords);
        setMeta('name', 'ICBM', `${seo.geo_latitude}, ${seo.geo_longitude}`);
      }

      // 4. OpenGraph Tags (Facebook, WhatsApp, Instagram, LinkedIn)
      setMeta('property', 'og:site_name', seo.business_name || 'PB08 TAXI');
      setMeta('property', 'og:title', seo.og_title || seo.meta_title);
      setMeta('property', 'og:description', seo.og_description || seo.meta_description);
      if (seo.og_image) {
        setMeta('property', 'og:image', seo.og_image);
      }
      if (seo.canonical_url) {
        setMeta('property', 'og:url', seo.canonical_url);
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
          linkCanonical = document.createElement('link');
          linkCanonical.setAttribute('rel', 'canonical');
          document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', seo.canonical_url);
      }

      // 5. Twitter Card Tags
      setMeta('name', 'twitter:card', seo.twitter_card || 'summary_large_image');
      setMeta('name', 'twitter:title', seo.og_title || seo.meta_title);
      setMeta('name', 'twitter:description', seo.og_description || seo.meta_description);
      if (seo.og_image) {
        setMeta('name', 'twitter:image', seo.og_image);
      }

      // 6. Search Engine Verification
      if (seo.google_site_verification) {
        setMeta('name', 'google-site-verification', seo.google_site_verification);
      }

      // 7. Schema.org TaxiService JSON-LD Structured Data
      try {
        let schemaEl = document.getElementById('seo-dynamic-schema');
        if (!schemaEl) {
          schemaEl = document.createElement('script');
          schemaEl.id = 'seo-dynamic-schema';
          schemaEl.type = 'application/ld+json';
          document.head.appendChild(schemaEl);
        }

        const areaList = seo.service_areas
          ? seo.service_areas.split(',').map((s) => s.trim()).filter(Boolean)
          : ['Jalandhar', 'Punjab', 'Delhi Airport', 'Amritsar Airport'];

        const schemaData = {
          '@context': 'https://schema.org',
          '@type': 'TaxiService',
          name: seo.business_name || 'PB08 TAXI',
          url: seo.canonical_url || window.location.origin,
          logo: seo.og_image || undefined,
          image: seo.og_image || undefined,
          description: seo.meta_description || undefined,
          priceRange: seo.schema_taxi_price_range || '₹₹',
          currenciesAccepted: 'INR',
          paymentAccepted: 'Cash, UPI, Online',
          areaServed: areaList,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Jalandhar',
            addressRegion: seo.geo_region || 'Punjab',
            addressCountry: 'IN'
          },
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59'
          }
        };

        schemaEl.text = JSON.stringify(schemaData);
      } catch (err) {
        console.warn('Failed to inject dynamic SEO Schema:', err);
      }

      // 8. Google Analytics 4 (GA4) Injection
      if (seo.google_analytics_id && !document.getElementById('seo-ga4-script')) {
        const gaScript = document.createElement('script');
        gaScript.id = 'seo-ga4-script';
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${seo.google_analytics_id}`;
        document.head.appendChild(gaScript);

        const gaInit = document.createElement('script');
        gaInit.id = 'seo-ga4-init';
        gaInit.text = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${seo.google_analytics_id}');
        `;
        document.head.appendChild(gaInit);
      }

      // 9. Meta / Facebook Pixel Injection
      if (seo.meta_pixel_id && !document.getElementById('seo-meta-pixel')) {
        const pixelScript = document.createElement('script');
        pixelScript.id = 'seo-meta-pixel';
        pixelScript.text = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${seo.meta_pixel_id}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(pixelScript);
      }

      // 10. Custom Head Code Injection (Safe HTML or Script)
      if (seo.custom_head_code && !document.getElementById('seo-custom-head-container')) {
        const customContainer = document.createElement('div');
        customContainer.id = 'seo-custom-head-container';
        customContainer.style.display = 'none';
        customContainer.innerHTML = seo.custom_head_code;
        document.body.appendChild(customContainer);
      }
    };

    // First attempt: Instant hydration from localStorage cache
    try {
      const cached = localStorage.getItem('pb08_seo_settings_cache');
      if (cached) {
        applySEOSettings(JSON.parse(cached));
      }
    } catch (e) {}

    // Second attempt: Fetch fresh settings from backend API
    getPublicSEOSettings()
      .then((fresh) => {
        if (fresh) {
          try {
            localStorage.setItem('pb08_seo_settings_cache', JSON.stringify(fresh));
          } catch (e) {}
          applySEOSettings(fresh);
        }
      })
      .catch((err) => {
        console.warn('SEO settings could not be fetched:', err);
      });
  }, []);

  return null;
}
