"""
PB08 TAXI - Instant Google Indexing API Automation
Notifies Google Search Indexing API directly to index/re-crawl website URLs in bulk.
"""

import os
import sys
import glob
import time
import json
import argparse
import xml.etree.ElementTree as ET
import urllib.request

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import requests
from google.oauth2 import service_account
import google.auth.transport.requests

SCOPES = ["https://www.googleapis.com/auth/indexing"]
INDEXING_PUBLISH_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"
INDEXING_METADATA_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications/metadata"

DEFAULT_SITEMAP_URL = "https://www.pb08taxi.com/sitemap.xml"
LOCAL_SITEMAP_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "sitemap.xml")


def find_key_file(custom_path=None):
    if custom_path and os.path.exists(custom_path):
        return custom_path
    
    # Check env var
    env_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if env_path and os.path.exists(env_path):
        return env_path
    
    # Check root dir and current dir for service account json
    candidates = (
        glob.glob("charged-camera*.json") +
        glob.glob("service_account*.json") +
        glob.glob("../*.json") +
        glob.glob("*.json")
    )
    for c in candidates:
        try:
            with open(c, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("type") == "service_account" and "private_key" in data:
                    return c
        except Exception:
            continue
            
    return None


def get_authenticated_session(key_path):
    print(f"[*] Using Service Account Key: {os.path.abspath(key_path)}")
    with open(key_path, "r", encoding="utf-8") as f:
        key_data = json.load(f)
    client_email = key_data.get("client_email")
    project_id = key_data.get("project_id")
    print(f"    Service Account Email: {client_email}")
    print(f"    Project ID:            {project_id}")

    credentials = service_account.Credentials.from_service_account_file(key_path, scopes=SCOPES)
    auth_req = google.auth.transport.requests.Request()
    credentials.refresh(auth_req)
    
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {credentials.token}",
        "Content-Type": "application/json"
    })
    return session, client_email


def extract_urls_from_sitemap(sitemap_url_or_path):
    urls = []
    content = None
    if sitemap_url_or_path.startswith("http://") or sitemap_url_or_path.startswith("https://"):
        try:
            print(f"[*] Fetching live sitemap from {sitemap_url_or_path}...")
            req = urllib.request.Request(sitemap_url_or_path, headers={"User-Agent": "PB08Taxi-Indexer/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                content = resp.read()
        except Exception as e:
            print(f"[!] Warning: Failed to fetch live sitemap ({e}). Falling back to local file.")
            
    if not content and os.path.exists(LOCAL_SITEMAP_PATH):
        print(f"[*] Reading local sitemap from {LOCAL_SITEMAP_PATH}...")
        with open(LOCAL_SITEMAP_PATH, "rb") as f:
            content = f.read()

    if not content:
        raise RuntimeError("Could not find or read sitemap from either remote or local path.")

    root = ET.fromstring(content)
    ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for elem in root.findall("ns:url/ns:loc", ns):
        if elem.text:
            urls.append(elem.text.strip())

    if not urls:
        for elem in root.iter():
            if elem.tag.endswith("loc") and elem.text and elem.text.startswith("http"):
                urls.append(elem.text.strip())

    return list(dict.fromkeys(urls))


def publish_url(session, url, action="URL_UPDATED"):
    payload = {
        "url": url,
        "type": action
    }
    response = session.post(INDEXING_PUBLISH_ENDPOINT, json=payload, timeout=15)
    return response


def get_metadata(session, url):
    response = session.get(f"{INDEXING_METADATA_ENDPOINT}?url={url}", timeout=15)
    return response


def main():
    parser = argparse.ArgumentParser(description="PB08 TAXI Google Indexing API Automation")
    parser.add_argument("--key", help="Path to Google Service Account JSON key", default=None)
    parser.add_argument("--url", help="Single URL to submit for indexing", default=None)
    parser.add_argument("--status", help="Check indexing status/metadata for a URL", default=None)
    parser.add_argument("--sitemap", help="Submit all URLs from sitemap.xml", action="store_true")
    parser.add_argument("--delete", help="Send URL_DELETED notification instead", action="store_true")
    args = parser.parse_args()

    print("=" * 65)
    print(">> PB08 TAXI - Google Indexing API Suite")
    print("=" * 65)

    key_file = find_key_file(args.key)
    if not key_file:
        print("\n[ERROR] Google Service Account JSON key file not found!")
        print("Please place your service account json in the project root or specify with --key.")
        sys.exit(1)

    try:
        session, service_account_email = get_authenticated_session(key_file)
    except Exception as e:
        print(f"\n[ERROR] Authentication failed: {e}")
        sys.exit(1)

    # 1. Metadata Query
    if args.status:
        url = args.status
        print(f"\n[*] Checking metadata for: {url}")
        res = get_metadata(session, url)
        print(f"Status Code: {res.status_code}")
        print(json.dumps(res.json(), indent=2))
        return

    # 2. Single URL Submission
    if args.url:
        action = "URL_DELETED" if args.delete else "URL_UPDATED"
        print(f"\n[*] Submitting single URL ({action}): {args.url}")
        res = publish_url(session, args.url, action=action)
        if res.status_code == 200:
            print("[OK] Success (200 OK)! Google received indexing notification.")
            print(json.dumps(res.json(), indent=2))
        else:
            print(f"[FAIL] HTTP {res.status_code}:")
            print(res.text)
        return

    # 3. Default or Sitemap Bulk Indexing
    print("\n[*] Extracting URLs from Sitemap...")
    urls = extract_urls_from_sitemap(DEFAULT_SITEMAP_URL)
    print(f"Found {len(urls)} target URLs to index:\n")

    action = "URL_DELETED" if args.delete else "URL_UPDATED"
    success_count = 0
    fail_count = 0

    for i, u in enumerate(urls, 1):
        print(f"[{i:02d}/{len(urls):02d}] {u} ... ", end="", flush=True)
        try:
            res = publish_url(session, u, action=action)
            if res.status_code == 200:
                print("[OK] 200 OK (Submitted)")
                success_count += 1
            else:
                data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
                err_msg = data.get("error", {}).get("message", res.text)
                print(f"[FAIL] {res.status_code}: {err_msg}")
                fail_count += 1
                if "Web Search Indexing API has not been used" in err_msg or "PERMISSION_DENIED" in str(data):
                    print("\n" + "!" * 65)
                    print("[!] ACTION REQUIRED TO COMPLETE SETUP:")
                    print("1. Enable Web Search Indexing API in Google Cloud Console:")
                    print("   Link: https://console.developers.google.com/apis/api/indexing.googleapis.com/overview?project=586266972896")
                    print(f"2. Add this Service Account as OWNER in Google Search Console:")
                    print(f"   Email: {service_account_email}")
                    print("   (GSC -> Settings -> Users and permissions -> Add user -> Role: Owner)")
                    print("!" * 65)
                    break
        except Exception as e:
            print(f"[ERROR] Network error: {e}")
            fail_count += 1
            
        time.sleep(0.4)

    print("\n" + "=" * 65)
    print(f"Summary: {success_count} succeeded, {fail_count} failed out of {len(urls)} URLs")
    print("=" * 65)


if __name__ == "__main__":
    main()
