"""
Enhance Phone Number Promotion Across PB08 TAXI
Promotes +91-9888-079-736 across Navbar, Hero, Contact, Footer, FAQ, and Modal.
"""

import os
import re

PHONE_DISPLAY = "+91 98880 79736"
PHONE_CLEAN = "919888079736"
PHONE_TEL = "+919888079736"

# 1. Update Navbar.jsx
navbar_path = "frontend/src/components/Navbar.jsx"
if os.path.exists(navbar_path):
    with open(navbar_path, "r", encoding="utf-8") as f:
        code = f.read()

    # Fallback phone
    code = code.replace("'+91 98765 43210'", f"'{PHONE_DISPLAY}'")
    
    # Top micro banner
    code = re.sub(
        r'\{/\* Top micro banner.*?\*/\}\s*<div className="bg-taxi-yellow[^>]*>.*?</div>',
        '''{/* Top micro banner with Direct Click-to-Call */}
      <div className="bg-taxi-yellow text-black text-xs font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center space-x-2 sm:space-x-3">
        <a 
          href={telLink}
          onClick={() => trackCallClick('Top Micro Banner')}
          className="inline-flex items-center space-x-1.5 hover:underline font-black cursor-pointer"
          title={`Call 24/7 Helpline ${phone}`}
        >
          <Phone className="w-3.5 h-3.5 fill-black text-black animate-pulse" />
          <span>24/7 HELPLINE: {phone} (TAP TO CALL)</span>
        </a>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline font-bold">10-MIN PICKUP IN JALANDHAR & OUTSTATION</span>
      </div>''',
        code,
        flags=re.DOTALL
    )

    # Desktop action button
    code = re.sub(
        r'<a\s+href=\{telLink\}\s+onClick=\{\(\) => trackCallClick\(\'Desktop Navbar Helpline\'\)\}\s+className="flex items-center space-x-2 text-zinc-200[^"]*"[^>]*>.*?<span>\{phone\}</span>\s*</a>',
        '''<a
              href={telLink}
              onClick={() => trackCallClick('Desktop Navbar Helpline')}
              className="flex items-center space-x-2 text-zinc-100 hover:text-taxi-yellow px-3.5 py-2 text-sm font-extrabold bg-zinc-900 border border-zinc-700/80 hover:border-taxi-yellow rounded-full transition-all"
            >
              <Phone className="w-4 h-4 text-taxi-yellow fill-taxi-yellow animate-pulse" />
              <span>Call: {phone}</span>
            </a>''',
        code,
        flags=re.DOTALL
    )

    # Mobile action buttons
    code = re.sub(
        r'\{/\* Mobile Menu Button \*/\}\s*<div className="flex md:hidden items-center space-x-2">\s*<button\s+onClick=\{onOpenBooking\}\s+className="bg-taxi-yellow text-black font-extrabold px-4 py-2 rounded-full text-xs min-h-\[42px\][^"]*"[^>]*>\s*Book\s*</button>',
        '''{/* Mobile Action Buttons */}
          <div className="flex md:hidden items-center space-x-1.5">
            <a
              href={telLink}
              onClick={() => trackCallClick('Mobile Header Call Button')}
              aria-label={`Call ${phone}`}
              className="bg-taxi-yellow/20 hover:bg-taxi-yellow/30 text-taxi-yellow border border-taxi-yellow/50 font-black px-2.5 py-1.5 rounded-full text-xs min-h-[38px] flex items-center space-x-1 active:scale-95 transition-transform"
            >
              <Phone className="w-3.5 h-3.5 fill-taxi-yellow" />
              <span>Call</span>
            </a>
            <button
              onClick={() => {
                trackBookRideClick('Mobile Header Book Button');
                onOpenBooking();
              }}
              className="bg-taxi-yellow text-black font-extrabold px-3 py-1.5 rounded-full text-xs min-h-[38px] flex items-center justify-center active:scale-95 transition-transform"
            >
              Book
            </button>''',
        code,
        flags=re.DOTALL
    )

    # Mobile drawer call button
    code = re.sub(
        r'<a\s+href=\{telLink\}\s+onClick=\{\(\) => trackCallClick\(\'Mobile Drawer Helpline\'\)\}\s+className="flex items-center space-x-2 text-zinc-300[^"]*"[^>]*>.*?<span>Call: \{phone\}</span>\s*</a>',
        '''<a
              href={telLink}
              onClick={() => trackCallClick('Mobile Drawer Helpline')}
              className="flex items-center justify-center space-x-2 bg-zinc-900 border border-taxi-yellow/40 text-taxi-yellow py-3 rounded-xl font-black text-sm hover:bg-zinc-800 transition-colors"
            >
              <Phone className="w-4 h-4 fill-taxi-yellow" />
              <span>Call 24/7 Helpline: {phone}</span>
            </a>''',
        code,
        flags=re.DOTALL
    )

    with open(navbar_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated Navbar.jsx")

# 2. Update HeroSlider.jsx
hero_path = "frontend/src/components/HeroSlider.jsx"
if os.path.exists(hero_path):
    with open(hero_path, "r", encoding="utf-8") as f:
        code = f.read()
    code = code.replace("'+91 98765 43210'", f"'{PHONE_DISPLAY}'")
    # Enhance call button in hero
    code = re.sub(
        r'<a\s+href=\{telLink\}\s+className="inline-flex items-center justify-center bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-base px-6 py-4 rounded-2xl border border-zinc-700 transition-colors"\s*>\s*Call 24/7: \{phone\}\.\s*</a>',
        '''<a
              href={telLink}
              className="inline-flex items-center justify-center space-x-2 bg-zinc-900/90 hover:bg-zinc-800 text-white hover:text-taxi-yellow font-extrabold text-base px-6 py-4 sm:py-5 rounded-2xl border-2 border-zinc-700 hover:border-taxi-yellow transition-all shadow-lg"
            >
              <Phone className="w-5 h-5 text-taxi-yellow animate-pulse" />
              <span>Call 24/7: {phone}</span>
            </a>''',
        code
    )
    with open(hero_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated HeroSlider.jsx")

# 3. Update ContactSection.jsx
contact_path = "frontend/src/components/ContactSection.jsx"
if os.path.exists(contact_path):
    with open(contact_path, "r", encoding="utf-8") as f:
        code = f.read()
    code = code.replace("'+91 98765 43210'", f"'{PHONE_DISPLAY}'")
    code = code.replace("'919876543210'", f"'{PHONE_CLEAN}'")
    with open(contact_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated ContactSection.jsx")

# 4. Update FAQSection.jsx
faq_path = "frontend/src/components/FAQSection.jsx"
if os.path.exists(faq_path):
    with open(faq_path, "r", encoding="utf-8") as f:
        code = f.read()
    code = code.replace("'+91 98765 43210'", f"'{PHONE_DISPLAY}'")
    code = code.replace("<span>Call Now</span>", "<span>Call: {phone}</span>")
    with open(faq_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated FAQSection.jsx")

# 5. Update Footer.jsx
footer_path = "frontend/src/components/Footer.jsx"
if os.path.exists(footer_path):
    with open(footer_path, "r", encoding="utf-8") as f:
        code = f.read()
    code = code.replace("'+91 98765 43210'", f"'{PHONE_DISPLAY}'")
    
    # Add High-Conversion Dispatch Banner above the footer columns if not already present
    if "24/7 Jalandhar Taxi Dispatch Helpline" not in code:
        banner_html = '''        {/* High-Conversion 24/7 Callout Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-taxi-yellow/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-taxi-yellow text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 inline animate-pulse" />
              <span>24/7 Jalandhar Taxi Dispatch Helpline</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Need an Instant Taxi in Jalandhar or Outstation?
            </h3>
            <p className="text-zinc-300 text-sm">
              Cabs arrive at your doorstep in 10-15 minutes. Call direct for immediate dispatch with zero surge charges.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
            <a
              href={telLink}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-black text-base px-7 py-3.5 rounded-2xl shadow-xl shadow-yellow-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Phone className="w-5 h-5 fill-black" />
              <span>Call: {phone}</span>
            </a>
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl border border-zinc-700 hover:border-taxi-yellow transition-all cursor-pointer"
            >
              <Car className="w-4 h-4 text-taxi-yellow" />
              <span>Book Online</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">'''
        
        code = code.replace('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">', banner_html)
        print("Added Dispatch Banner to Footer.jsx")

    with open(footer_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated Footer.jsx")

# 6. Update BookingModal.jsx
modal_path = "frontend/src/components/BookingModal.jsx"
if os.path.exists(modal_path):
    with open(modal_path, "r", encoding="utf-8") as f:
        code = f.read()
    
    # Add fast helpline bar under header if not present
    if "Need a cab urgently in 10 mins?" not in code:
        old_header_end = '''              </div>
            </div>

            {error && ('''
        
        new_header_end = '''              </div>
            </div>

            {/* Quick Direct Call Helpline */}
            <div className="mb-4 px-3.5 py-2.5 bg-taxi-yellow/10 border border-taxi-yellow/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-zinc-300 font-medium">Need urgent cab in 10 mins?</span>
              <a
                href="tel:+919888079736"
                className="font-black text-taxi-yellow hover:underline flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5 fill-taxi-yellow" />
                <span>Call +91-9888-079-736</span>
              </a>
            </div>

            {error && ('''
        if old_header_end in code:
            code = code.replace(old_header_end, new_header_end)
            print("Added fast call helpline to BookingModal.jsx")

    with open(modal_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated BookingModal.jsx")

# 7. Update other pages with dummy phone numbers
for root, dirs, files in os.walk("frontend/src/pages"):
    for file in files:
        if file.endswith((".jsx", ".js")):
            p = os.path.join(root, file)
            with open(p, "r", encoding="utf-8") as f:
                c = f.read()
            if "98765 43210" in c or "9876543210" in c:
                c = c.replace("98765 43210", "98880 79736")
                c = c.replace("9876543210", "9888079736")
                with open(p, "w", encoding="utf-8") as f:
                    f.write(c)
                print(f"Cleaned dummy phone in {file}")

print("All files processed successfully!")


# 8. Add Call Button to Landing Pages Hero Section
landing_pages = [
    "frontend/src/pages/JalandharTaxiPage.jsx",
    "frontend/src/pages/NearMeTaxiPage.jsx",
    "frontend/src/pages/AirportTaxiPage.jsx",
    "frontend/src/pages/OneWayTaxiPage.jsx"
]

for lp in landing_pages:
    if os.path.exists(lp):
        with open(lp, "r", encoding="utf-8") as f:
            code = f.read()
        if "Call 24/7:" not in code:
            old_pattern = '                <a\n                  href={`https://wa.me/${cleanPhone}'
            call_btn = '                <a\n                  href={`tel:${cleanPhone}`}\n                  className="px-6 py-4 bg-zinc-900 border-2 border-taxi-yellow/60 hover:border-taxi-yellow text-white hover:text-taxi-yellow font-black text-base rounded-2xl hover:bg-zinc-850 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"\n                >\n                  <Phone className="w-5 h-5 text-taxi-yellow fill-taxi-yellow animate-pulse" />\n                  <span>Call 24/7: {supportPhone}</span>\n                </a>\n\n                <a\n                  href={`https://wa.me/${cleanPhone}'
            if old_pattern in code:
                code = code.replace(old_pattern, call_btn)
                with open(lp, "w", encoding="utf-8") as f:
                    f.write(code)
                print(f"Added Call button to {lp}")
            else:
                print(f"Pattern not found in {lp}")
        else:
            print(f"Call button already in {lp}")

near_me_path = "frontend/src/pages/NearMeTaxiPage.jsx"
with open(near_me_path, "r", encoding="utf-8") as f:
    text = f.read()

target = '                  <a\n                    href={`https://wa.me/${cleanPhone}?text=Hi%20PB08%20TAXI,%20I%20need%20a%20taxi%20near%20me%20in%20Jalandhar`}'
replacement = '                  <a\n                    href={`tel:${cleanPhone}`}\n                    className="px-6 py-4 bg-zinc-900 border-2 border-taxi-yellow/60 hover:border-taxi-yellow text-white hover:text-taxi-yellow font-black text-base rounded-2xl hover:bg-zinc-850 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"\n                  >\n                    <Phone className="w-5 h-5 text-taxi-yellow fill-taxi-yellow animate-pulse" />\n                    <span>Call 24/7: {supportPhone}</span>\n                  </a>\n\n' + target

if target in text and "Call 24/7:" not in text:
    text = text.replace(target, replacement)
    with open(near_me_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Added Call button to NearMeTaxiPage.jsx")
