import os

p = "frontend/src/context/SiteSettingsContext.jsx"
with open(p, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("site_logo_url: null,", "site_logo_url: '/Logo/Logo_PB08TAXI.webp',")
text = text.replace("site_favicon_url: null,", "site_favicon_url: '/Logo/pb08taxi-favicon-1791752586.png',")

old_copy = "  const copy = { ...obj };"
new_copy = """  const copy = { ...obj };
  if (!copy.site_logo_url) {
    copy.site_logo_url = '/Logo/Logo_PB08TAXI.webp';
  }
  if (!copy.site_favicon_url) {
    copy.site_favicon_url = '/Logo/pb08taxi-favicon-1791752586.png';
  }"""

if old_copy in text and "if (!copy.site_logo_url)" not in text:
    text = text.replace(old_copy, new_copy)

with open(p, "w", encoding="utf-8") as f:
    f.write(text)

print("SiteSettingsContext.jsx updated with default logo!")
