import React, { useEffect } from 'react';
import { getPublicSEOSettings } from '../api/client';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function SEOHead() {
  const { settings } = useSiteSettings();

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
      const canonicalUrl = seo.canonical_url || 'https://www.pb08taxi.com';
      setMeta('property', 'og:url', canonicalUrl);
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl);

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

      // 7. Schema.org Multi-Entity Structured Data Graph (TaxiService, LocalBusiness, WebSite, FAQPage)
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
          : ['Jalandhar', 'Punjab', 'Delhi Airport', 'Amritsar Airport', 'Chandigarh', 'Ludhiana', 'Phagwara', 'Himachal Pradesh'];

        const socialLinks = [
          settings?.social_facebook,
          settings?.social_instagram,
          settings?.social_twitter,
          settings?.social_youtube,
          `https://wa.me/${(settings?.whatsapp_number || seo.support_phone || '+919888079736').replace(/\D/g, '')}`
        ].filter(Boolean);

        const schemaGraph = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': `${canonicalUrl}/#organization`,
              name: seo.business_name || 'PB08 TAXI',
              url: canonicalUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${canonicalUrl}/icon-512.png`,
                width: 512,
                height: 512
              },
              image: `${canonicalUrl}/icon-512.png`,
              telephone: seo.support_phone || '+919888079736',
              sameAs: socialLinks
            },
            {
              '@type': 'TaxiService',
              additionalType: 'https://schema.org/LocalBusiness',
              '@id': `${canonicalUrl}/#taxiservice`,
              name: seo.business_name || 'PB08 TAXI',
              alternateName: ['Jalandhar Taxi', 'One Way Jalandhar', 'PB08 TAXI', 'Airport taxi'],
              url: canonicalUrl,
              telephone: seo.support_phone || '+919888079736',
              sameAs: socialLinks,
              logo: `${canonicalUrl}/icon-512.png`,
              image: seo.og_image || `${canonicalUrl}/icon-512.png`,
              description: seo.meta_description || 'PB08 TAXI — 24/7 reliable taxi & cab booking in Jalandhar, Punjab. Affordable airport transfers & outstation rides. Instant WhatsApp booking confirmation.',
              priceRange: seo.schema_taxi_price_range || '₹₹',
              currenciesAccepted: 'INR',
              paymentAccepted: 'Cash, UPI, Google Pay, PhonePe, Paytm, Net Banking',
              areaServed: areaList,
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Model Town, Near BMC Chowk',
                addressLocality: 'Jalandhar',
                addressRegion: seo.geo_region || 'Punjab',
                postalCode: '144001',
                addressCountry: 'IN'
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: Number(seo.geo_latitude || 31.3260),
                longitude: Number(seo.geo_longitude || 75.5762)
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '00:00',
                closes: '23:59'
              },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'PB08 TAXI — Jalandhar Taxi, One Way Jalandhar & Airport Taxi Routes',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Jalandhar to Delhi & Delhi to Jalandhar Taxi',
                      description: '24/7 One Way Jalandhar and round-trip Airport taxi between Jalandhar and Delhi IGI Airport / NCR.'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Jalandhar to Amritsar & Amritsar to Jalandhar Taxi',
                      description: 'Fast cab service for Jalandhar to Amritsar Golden Temple, ATQ Airport, and Amritsar to Jalandhar.'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Jalandhar to Chandigarh & Chandigarh to Jalandhar Taxi',
                      description: 'One-way and round-trip taxi service connecting Jalandhar to Chandigarh and Chandigarh to Jalandhar.'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Jalandhar to Ludhiana & Ludhiana to Jalandhar Taxi',
                      description: 'Express intercity taxi for Jalandhar to Ludhiana and Ludhiana to Jalandhar.'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Jalandhar to Hoshiarpur & Hoshiarpur to Jalandhar Taxi',
                      description: '24/7 local and outstation cab between Jalandhar to Hoshiarpur and Hoshiarpur to Jalandhar.'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'One Way Jalandhar & 24/7 Airport Taxi',
                      description: 'Top-rated Jalandhar Taxi with one-way drop fares and zero return charges.'
                    }
                  }
                ]
              }
            },
            {
              '@type': 'WebSite',
              '@id': `${canonicalUrl}/#website`,
              url: canonicalUrl,
              name: seo.business_name || 'PB08 TAXI',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${canonicalUrl}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            },
            {
              '@type': 'FAQPage',
              '@id': `${canonicalUrl}/#faq`,
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How can I book a cab with PB08 TAXI?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Booking is effortless! Click the \'One Click Book Your Ride\' button anywhere on our website, enter your pickup location, drop destination, date & time, and select your preferred vehicle. You will receive instant booking confirmation directly on WhatsApp with driver and vehicle details.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Do you offer airport taxi transfers for Delhi (DEL), Amritsar (ATQ), and Chandigarh (IXC)?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! We specialize in on-time airport transfers between Jalandhar, all Punjab towns, and Delhi IGI Airport (T1, T2, T3), Amritsar Sri Guru Ram Dass Jee International Airport, and Chandigarh Shaheed Bhagat Singh Airport with live flight tracking.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Which vehicles are available in your taxi fleet?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We maintain a pristine, fully air-conditioned fleet: Compact Sedans (Swift Dzire, Honda Amaze), Premium SUVs (Toyota Innova Crysta, Ertiga, Carens), Luxury Executive Cars (Toyota Fortuner, BMW, Audi for weddings), and 12-17 seater Tempo Travellers.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Are PB08 TAXI fares transparent with no hidden charges?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, 100%. We provide transparent fixed pricing with zero surge fees. Fares are confirmed in advance with complete clarity on vehicle charges, driver allowance, tolls, and state permits.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Can I book a one-way outstation cab or is it only round-trip?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'PB08 TAXI offers both one-way drop cabs and round-trip rentals. If you only need a drop to Delhi, Chandigarh, Amritsar, Himachal (Shimla, Manali, Dharamshala), or Jammu, you only pay for the one-way route.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Are PB08 TAXI chauffeurs verified and safe for night travel?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Safety is our paramount commitment. Every chauffeur undergoes background screening, commercial licensing verification, and highway safety training. Our drivers are courteous, strictly non-smoking, and trained for late-night family travel.'
                  }
                }
              ]
            }
          ]
        };

        schemaEl.text = JSON.stringify(schemaGraph);
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
