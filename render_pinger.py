#!/usr/bin/env python3
"""
PB08 TAXI & OpenWA — 24/7 Render Keep-Alive Pinger
Pings both Render deployments every 10 minutes to prevent them from spinning down (sleeping).
"""

import sys
import os
import time
import argparse
import urllib.request
import urllib.error
from datetime import datetime

# Configure UTF-8 encoding on Windows terminal if possible
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

TARGETS = [
    {
        "name": "PB08 TAXI Backend (Dual Heartbeat)",
        "url": "https://pb08-taxi-api.onrender.com/api/keepalive",
        "workspace": "PB08TAXI"
    },
    {
        "name": "OpenWA WhatsApp Gateway",
        "url": "https://pb08-whatsapp-api.onrender.com/api/health",
        "workspace": "PB08-Whatsapp-API"
    }
]

def ping_target(target: dict, timeout: int = 30) -> tuple[int, float, str]:
    """Pings a single target URL. Returns (http_code, latency_seconds, message)."""
    start = time.time()
    req = urllib.request.Request(
        target["url"],
        headers={"User-Agent": "PB08-KeepAlive-Pinger/1.0 (+https://pb-08-taxi.vercel.app)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            latency = time.time() - start
            return response.status, latency, "OK"
    except urllib.error.HTTPError as e:
        latency = time.time() - start
        return e.code, latency, f"HTTP Error: {e.reason}"
    except urllib.error.URLError as e:
        latency = time.time() - start
        return 0, latency, f"Network Error: {e.reason}"
    except Exception as e:
        latency = time.time() - start
        return 0, latency, f"Error: {str(e)}"

def run_ping_cycle():
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n[{now_str}] [*] Pinging Render services to prevent idle sleep...")
    all_ok = True
    for t in TARGETS:
        code, latency, msg = ping_target(t)
        latency_ms = int(latency * 1000)
        status_tag = "[ONLINE]" if (code >= 200 and code < 400) else "[OFFLINE]"
        print(f"  {status_tag} [{t['workspace']}] {t['name']}")
        print(f"     URL: {t['url']}")
        print(f"     Status: HTTP {code} ({msg}) | Latency: {latency_ms}ms")
        if code < 200 or code >= 400:
            all_ok = False
    return all_ok

def main():
    parser = argparse.ArgumentParser(description="24/7 Render Keep-Alive Pinger for PB08 TAXI & OpenWA")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--interval", type=int, default=600, help="Interval in seconds (default: 600s = 10 minutes)")
    args = parser.parse_args()

    print("=" * 65)
    print(" PB08 TAXI & OpenWA WhatsApp -- 24/7 Render Keep-Alive Pinger")
    print("=" * 65)
    print(f"Interval: Every {args.interval} seconds ({args.interval // 60} minutes)")
    print(f"Monitored Targets: {len(TARGETS)}")
    for t in TARGETS:
        print(f" - {t['name']}: {t['url']}")
    print("=" * 65)

    if args.once:
        success = run_ping_cycle()
        sys.exit(0 if success else 1)

    print("\nPinger is running! Press Ctrl+C anytime to stop.\n")
    try:
        while True:
            run_ping_cycle()
            print(f"\nWaiting {args.interval // 60} minutes until next keep-alive ping...")
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nPinger stopped by user.")
        sys.exit(0)

if __name__ == "__main__":
    main()
