"""
Comprehensive Playwright Audit for PB08 TAXI
Verifies Logo display, Phone numbers, and Floating Call CTAs across desktop and mobile viewports.
"""

import os
import sys
import time
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\smash\.gemini\antigravity\brain\796d66d8-301a-47bf-8cd9-94e7d65d2721"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def audit_url(url, label="Audit"):
    print("=" * 65)
    print(f">> Starting Playwright Audit on: {url} ({label})")
    print("=" * 65)

    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)

        # 1. Desktop Test (1366x768)
        print("\n[DESKTOP] Testing Desktop View (1366x768)...")
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
        except Exception as e:
            print(f"[WARN] Page load: {e}")

        page.wait_for_timeout(2000)

        # Audit Logo
        logo_el = page.query_selector("header img[alt*='PB08']") or page.query_selector("header img")
        car_fallback = page.query_selector("header .rounded-xl.bg-taxi-yellow")
        
        if logo_el:
            src = logo_el.get_attribute("src")
            natural_w = page.evaluate("(img) => img.naturalWidth", logo_el)
            natural_h = page.evaluate("(img) => img.naturalHeight", logo_el)
            is_visible = logo_el.is_visible()
            print(f"  [OK] Header Logo Found:")
            print(f"       - src:           {src}")
            print(f"       - Dimensions:    {natural_w}x{natural_h} px")
            print(f"       - Is Visible:    {is_visible}")
            results["logo_status"] = "PASS" if natural_w > 0 and is_visible else "FAIL"
        else:
            print(f"  [FAIL] Header Logo element NOT found! (Car fallback icon: {bool(car_fallback)})")
            results["logo_status"] = "FAIL"

        # Audit Phone Number in Top Announcement Banner
        banner_phone = page.query_selector("a[href^='tel:']")
        if banner_phone:
            href = banner_phone.get_attribute("href")
            text = banner_phone.inner_text().strip()
            print(f"  [OK] Top Banner Call CTA Found:")
            print(f"       - href: {href}")
            print(f"       - text: {text}")
            results["top_banner_phone"] = "PASS"
        else:
            print(f"  [INFO] Top Banner Call CTA not found directly")
            results["top_banner_phone"] = "MISSING"

        # Audit Floating Action Buttons (Call + WhatsApp)
        floating_call = page.query_selector("a[title*='Call 24/7 Helpline']") or page.query_selector("a[aria-label*='Call PB08 TAXI']")
        floating_wa = page.query_selector("button[aria-label*='WhatsApp']")
        
        if floating_call:
            call_text = floating_call.inner_text().strip()
            call_href = floating_call.get_attribute("href")
            print(f"  [OK] Floating 24/7 Call Button Found:")
            print(f"       - href: {call_href}")
            print(f"       - text: {call_text}")
            results["floating_call"] = "PASS"
        else:
            print(f"  [INFO] Floating Call Button not found")
            results["floating_call"] = "MISSING"

        print(f"  [OK] Floating WhatsApp Button: {'Found' if floating_wa else 'Missing'}")

        # Desktop Screenshot
        desktop_shot = os.path.join(ARTIFACTS_DIR, f"{label}_desktop.png")
        page.screenshot(path=desktop_shot, full_page=False)
        print(f"  [SCREENSHOT] Saved Desktop Screenshot to: {desktop_shot}")

        context.close()

        # 2. Mobile Test (iPhone 14 Viewport: 390x844)
        print("\n[MOBILE] Testing Mobile View (390x844 iPhone Viewport)...")
        mobile_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        )
        mobile_page = mobile_context.new_page()

        try:
            mobile_page.goto(url, wait_until="networkidle", timeout=30000)
        except Exception as e:
            print(f"[WARN] Mobile page load: {e}")

        mobile_page.wait_for_timeout(2000)

        # Check Mobile Header Call Button
        mobile_header_call = mobile_page.query_selector("header a[aria-label*='Call']")
        if mobile_header_call:
            print(f"  [OK] Mobile Header Direct Call Button Found: {mobile_header_call.get_attribute('href')}")
            results["mobile_header_call"] = "PASS"
        else:
            print(f"  [INFO] Mobile Header direct call button: {bool(mobile_header_call)}")

        # Check Mobile Floating Call Button
        mob_float_call = mobile_page.query_selector("a[title*='Call 24/7 Helpline']") or mobile_page.query_selector("a[aria-label*='Call PB08 TAXI']")
        if mob_float_call:
            print(f"  [OK] Mobile Floating Call Button Found: {mob_float_call.inner_text().strip()}")
            results["mobile_floating_call"] = "PASS"

        # Check Mobile Logo
        mob_logo = mobile_page.query_selector("header img")
        if mob_logo:
            mob_w = mobile_page.evaluate("(img) => img.naturalWidth", mob_logo)
            print(f"  [OK] Mobile Logo Found: naturalWidth={mob_w}px")

        # Mobile Screenshot
        mobile_shot = os.path.join(ARTIFACTS_DIR, f"{label}_mobile.png")
        mobile_page.screenshot(path=mobile_shot, full_page=False)
        print(f"  [SCREENSHOT] Saved Mobile Screenshot to: {mobile_shot}")

        mobile_context.close()
        browser.close()

    print("\n" + "=" * 65)
    print(f"Audit Results for {label}:")
    for k, v in results.items():
        print(f" - {k}: {v}")
    print("=" * 65)
    return results


def main():
    # 1. Audit Live Site
    print(">>> AUDITING LIVE PRODUCTION SITE: https://www.pb08taxi.com")
    audit_url("https://www.pb08taxi.com", label="live_site")

    # 2. Start local Vite preview server to audit latest local build
    print("\n>>> STARTING LOCAL PREVIEW SERVER TO AUDIT LATEST LOCAL COMMITS...")
    proc = subprocess.Popen(
        ["npx.cmd", "vite", "preview", "--port", "4173"],
        cwd="frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(4)

    try:
        audit_url("http://localhost:4173", label="local_preview")
    finally:
        proc.terminate()
        try:
            proc.kill()
        except Exception:
            pass


if __name__ == "__main__":
    main()
