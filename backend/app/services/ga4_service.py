import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
import httpx
import time

try:
    from google.oauth2 import service_account
    import google.auth.transport.requests
    HAS_GOOGLE_AUTH = True
except ImportError:
    service_account = None
    HAS_GOOGLE_AUTH = False

try:
    import jwt
except ImportError:
    jwt = None

logger = logging.getLogger("ga4_service")

GA4_SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
GA4_API_BASE = "https://analyticsdata.googleapis.com/v1beta"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"

class GA4Service:
    @staticmethod
    def get_access_token_from_json(sa_json_str: str) -> Optional[str]:
        """Generate a Google OAuth2 access token from service account JSON string."""
        try:
            info = json.loads(sa_json_str)
            
            # Method 1: Use google-auth if installed
            if HAS_GOOGLE_AUTH and service_account is not None:
                try:
                    creds = service_account.Credentials.from_service_account_info(info, scopes=GA4_SCOPES)
                    req = google.auth.transport.requests.Request()
                    creds.refresh(req)
                    if creds.token:
                        return creds.token
                except Exception as ex:
                    logger.warning(f"google-auth refresh failed, falling back to direct JWT: {ex}")

            # Method 2: Standard RFC 7523 JWT Bearer grant fallback using PyJWT & httpx
            if jwt is not None and "private_key" in info and "client_email" in info:
                now = int(time.time())
                payload = {
                    "iss": info["client_email"],
                    "sub": info["client_email"],
                    "aud": GOOGLE_TOKEN_URI,
                    "scope": " ".join(GA4_SCOPES),
                    "iat": now,
                    "exp": now + 3600
                }
                headers = {}
                if "private_key_id" in info:
                    headers["kid"] = info["private_key_id"]
                    
                signed_jwt = jwt.encode(payload, info["private_key"], algorithm="RS256", headers=headers)
                
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(
                        GOOGLE_TOKEN_URI,
                        data={
                            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                            "assertion": signed_jwt
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data.get("access_token")
                    else:
                        logger.error(f"Google OAuth token endpoint returned {resp.status_code}: {resp.text}")
                        return None

            return None
        except Exception as e:
            logger.error(f"Failed to generate access token from service account: {e}")
            return None

    @staticmethod
    def get_service_account_email(sa_json_str: str) -> Optional[str]:
        try:
            info = json.loads(sa_json_str)
            return info.get("client_email")
        except Exception:
            return None

    @classmethod
    async def run_realtime_report(cls, sa_json_str: str, property_id: str) -> Dict[str, Any]:
        """Fetch active users in the last 30 minutes by city and device."""
        token = cls.get_access_token_from_json(sa_json_str)
        if not token:
            raise ValueError("Invalid or expired Google Cloud Service Account credentials.")

        url = f"{GA4_API_BASE}/properties/{property_id}:runRealtimeReport"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "dimensions": [
                {"name": "city"},
                {"name": "deviceCategory"}
            ],
            "metrics": [
                {"name": "activeUsers"}
            ]
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"GA4 API error ({resp.status_code}): {resp.text[:200]}")
            return resp.json()

    @classmethod
    async def run_overview_report(cls, sa_json_str: str, property_id: str, days: int = 7) -> Dict[str, Any]:
        """Fetch total users, sessions, pageviews, and bounce rate."""
        token = cls.get_access_token_from_json(sa_json_str)
        if not token:
            raise ValueError("Invalid or expired Google Cloud Service Account credentials.")

        url = f"{GA4_API_BASE}/properties/{property_id}:runReport"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        start_date = (date.today() - timedelta(days=days)).strftime("%Y-%m-%d")
        end_date = "today"

        payload = {
            "dateRanges": [{"startDate": start_date, "endDate": end_date}],
            "dimensions": [{"name": "date"}],
            "metrics": [
                {"name": "activeUsers"},
                {"name": "sessions"},
                {"name": "screenPageViews"},
                {"name": "userEngagementDuration"}
            ],
            "orderBys": [{"dimension": {"dimensionName": "date"}}]
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"GA4 API error ({resp.status_code}): {resp.text[:200]}")
            return resp.json()

    @classmethod
    async def run_traffic_sources(cls, sa_json_str: str, property_id: str, days: int = 7) -> Dict[str, Any]:
        """Fetch acquisition sources: Google Search, Direct, Social, etc."""
        token = cls.get_access_token_from_json(sa_json_str)
        if not token:
            raise ValueError("Invalid or expired Google Cloud Service Account credentials.")

        url = f"{GA4_API_BASE}/properties/{property_id}:runReport"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        start_date = (date.today() - timedelta(days=days)).strftime("%Y-%m-%d")

        payload = {
            "dateRanges": [{"startDate": start_date, "endDate": "today"}],
            "dimensions": [{"name": "sessionDefaultChannelGroup"}],
            "metrics": [{"name": "sessions"}, {"name": "activeUsers"}]
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"GA4 API error ({resp.status_code}): {resp.text[:200]}")
            return resp.json()

    @classmethod
    async def run_cities_report(cls, sa_json_str: str, property_id: str, days: int = 7) -> Dict[str, Any]:
        """Fetch top user cities (Jalandhar, Amritsar, Delhi, Chandigarh, etc.)."""
        token = cls.get_access_token_from_json(sa_json_str)
        if not token:
            raise ValueError("Invalid or expired Google Cloud Service Account credentials.")

        url = f"{GA4_API_BASE}/properties/{property_id}:runReport"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        start_date = (date.today() - timedelta(days=days)).strftime("%Y-%m-%d")

        payload = {
            "dateRanges": [{"startDate": start_date, "endDate": "today"}],
            "dimensions": [{"name": "city"}],
            "metrics": [{"name": "activeUsers"}, {"name": "sessions"}],
            "orderBys": [{"metric": {"metricName": "activeUsers"}, "desc": True}],
            "limit": 10
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"GA4 API error ({resp.status_code}): {resp.text[:200]}")
            return resp.json()
