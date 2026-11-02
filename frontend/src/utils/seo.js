/**
 * Dynamic SEO & Canonical Meta Helper
 * Ensures every landing page has unique Title, Meta Description, OpenGraph, and Canonical URL
 * to pass Google Search Console indexing and prevent duplicate page flags.
 */

function setMetaTag(attribute, name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function updatePageMeta({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://www.pb08taxi.com/Logo/pb08taxi-banner-default.webp',
  keywords
}) {
  if (typeof document === 'undefined') return;

  // 1. Title
  if (title) {
    document.title = title;
    setMetaTag('property', 'og:title', title);
    setMetaTag('name', 'twitter:title', title);
  }

  // 2. Description
  if (description) {
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:description', description);
    setMetaTag('name', 'twitter:description', description);
  }

  // 3. Keywords
  if (keywords) {
    setMetaTag('name', 'keywords', keywords);
  }

  // 4. Canonical URL (Critical for Google Search Console)
  if (canonicalUrl) {
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
    setMetaTag('property', 'og:url', canonicalUrl);
  }

  // 5. Social Image
  if (ogImage) {
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('name', 'twitter:image', ogImage);
  }
}
