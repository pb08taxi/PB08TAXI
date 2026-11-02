import json
import time
import threading
import logging
from typing import Any, Optional, Callable, Dict, List
from datetime import datetime, date

logger = logging.getLogger("pb08_cache")

def _json_serial(obj):
    """JSON serializer for objects not serializable by default json code."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    raise TypeError(f"Type {type(obj)} not serializable")

class InMemoryL1Cache:
    """Thread-safe, high-speed in-memory cache with monotonic TTL expiration."""
    def __init__(self, max_items: int = 1000):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.RLock()
        self._max_items = max_items

    def get(self, key: str) -> Optional[Any]:
        now = time.monotonic()
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            if entry["expiry"] and now > entry["expiry"]:
                del self._cache[key]
                return None
            return entry["val"]

    def set(self, key: str, val: Any, ttl: Optional[int] = None):
        expiry = time.monotonic() + ttl if ttl else None
        with self._lock:
            # Simple eviction if overflowing
            if len(self._cache) >= self._max_items and key not in self._cache:
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]
            self._cache[key] = {"val": val, "expiry": expiry}

    def delete(self, key: str):
        with self._lock:
            self._cache.pop(key, None)

    def delete_prefix(self, prefix: str) -> int:
        count = 0
        with self._lock:
            keys_to_del = [k for k in self._cache if k.startswith(prefix)]
            for k in keys_to_del:
                del self._cache[k]
                count += 1
        return count

    def clear(self):
        with self._lock:
            self._cache.clear()

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._cache)


class CacheService:
    """
    Unified High-Performance Caching Engine:
    - Tier 1: Microsecond In-Memory RAM Cache (Instant sub-1ms response)
    - Tier 2: Distributed Upstash / Redis Cache (Across multi-instance Render backends)
    - Zero-Fail Fallback: Automatic seamless fallback to RAM cache if Redis is offline or unconfigured.
    """
    def __init__(self):
        self._l1 = InMemoryL1Cache()
        self._redis_client = None
        self._upstash_rest_url = ""
        self._upstash_rest_token = ""
        self._is_redis_ready = False
        self._hits = 0
        self._misses = 0
        self._init_backend()

    def _init_backend(self):
        from app.config import get_settings
        settings = get_settings()

        # Check standard Redis URL (Upstash or Redis Cloud or local)
        redis_url = getattr(settings, "REDIS_URL", "").strip()
        if redis_url:
            try:
                import redis
                self._redis_client = redis.Redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_timeout=1.5,
                    socket_connect_timeout=1.5,
                    retry_on_timeout=True
                )
                self._redis_client.ping()
                self._is_redis_ready = True
                logger.info("[PB08 TAXI Cache] Connected to Redis successfully.")
            except Exception as e:
                logger.warning(f"[PB08 TAXI Cache] Redis init notice (using In-Memory cache): {e}")
                self._redis_client = None
                self._is_redis_ready = False

        # Check Upstash REST API credentials
        self._upstash_rest_url = getattr(settings, "UPSTASH_REDIS_REST_URL", "").strip().rstrip("/")
        self._upstash_rest_token = getattr(settings, "UPSTASH_REDIS_REST_TOKEN", "").strip()

    def get(self, key: str) -> Optional[Any]:
        # 1. Try L1 RAM Cache first (< 0.1ms)
        val = self._l1.get(key)
        if val is not None:
            self._hits += 1
            return val

        # 2. Try L2 Redis if available
        if self._is_redis_ready and self._redis_client:
            try:
                raw = self._redis_client.get(key)
                if raw:
                    self._hits += 1
                    data = json.loads(raw)
                    # Backfill L1 cache for 10s to prevent Redis hammering
                    self._l1.set(key, data, ttl=10)
                    return data
            except Exception as e:
                logger.warning(f"[Cache L2 Read Error] {e}")

        # 3. Try Upstash REST if configured
        if self._upstash_rest_url and self._upstash_rest_token:
            try:
                import httpx
                url = f"{self._upstash_rest_url}/get/{key}"
                headers = {"Authorization": f"Bearer {self._upstash_rest_token}"}
                resp = httpx.get(url, headers=headers, timeout=1.0)
                if resp.status_code == 200:
                    res_json = resp.json()
                    raw = res_json.get("result")
                    if raw:
                        self._hits += 1
                        data = json.loads(raw) if isinstance(raw, str) else raw
                        self._l1.set(key, data, ttl=10)
                        return data
            except Exception as e:
                logger.warning(f"[Cache Upstash REST Error] {e}")

        self._misses += 1
        return None

    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Cache value with specified TTL (seconds). Defaults to 300s (5 mins)."""
        # Save to L1 memory
        self._l1.set(key, value, ttl=ttl)

        # Save to L2 Redis
        if self._is_redis_ready and self._redis_client:
            try:
                serialized = json.dumps(value, default=_json_serial)
                self._redis_client.set(key, serialized, ex=ttl)
                return True
            except Exception as e:
                logger.warning(f"[Cache L2 Write Error] {e}")

        # Save to Upstash REST
        if self._upstash_rest_url and self._upstash_rest_token:
            try:
                import httpx
                serialized = json.dumps(value, default=_json_serial)
                url = f"{self._upstash_rest_url}/set/{key}?EX={ttl}"
                headers = {"Authorization": f"Bearer {self._upstash_rest_token}"}
                httpx.post(url, headers=headers, content=serialized, timeout=1.0)
                return True
            except Exception as e:
                logger.warning(f"[Cache Upstash REST Write Error] {e}")

        return True

    def delete(self, key: str):
        """Invalidate a specific cache key."""
        self._l1.delete(key)
        if self._is_redis_ready and self._redis_client:
            try:
                self._redis_client.delete(key)
            except Exception:
                pass
        if self._upstash_rest_url and self._upstash_rest_token:
            try:
                import httpx
                url = f"{self._upstash_rest_url}/del/{key}"
                headers = {"Authorization": f"Bearer {self._upstash_rest_token}"}
                httpx.post(url, headers=headers, timeout=1.0)
            except Exception:
                pass

    def invalidate_prefix(self, prefix: str) -> int:
        """Invalidate all keys matching prefix (e.g. 'fleet', 'settings', 'templates', 'slider')."""
        count = self._l1.delete_prefix(prefix)
        if self._is_redis_ready and self._redis_client:
            try:
                keys = self._redis_client.keys(f"{prefix}*")
                if keys:
                    self._redis_client.delete(*keys)
                    count += len(keys)
            except Exception:
                pass
        return count

    def get_or_set(self, key: str, fetcher_fn: Callable[[], Any], ttl: int = 300) -> Any:
        """Fetch from cache if present; otherwise compute via fetcher_fn, cache and return."""
        cached = self.get(key)
        if cached is not None:
            return cached
        val = fetcher_fn()
        if val is not None:
            self.set(key, val, ttl=ttl)
        return val

    def get_status(self) -> Dict[str, Any]:
        """Observability telemetry for cache health, hits, and active provider."""
        provider = "In-Memory RAM (Ultra-Fast Fallback)"
        if self._is_redis_ready:
            provider = "Redis / Upstash Connection Active"
        elif self._upstash_rest_url:
            provider = "Upstash REST API Active"

        total_reqs = self._hits + self._misses
        hit_ratio = round((self._hits / total_reqs * 100), 1) if total_reqs > 0 else 0.0

        return {
            "provider": provider,
            "is_redis_connected": self._is_redis_ready,
            "l1_memory_keys": self._l1.size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_ratio_percent": hit_ratio
        }

# Global Singleton Instance
cache_service = CacheService()

def get_cached_setting(db, key: str, default: str = "") -> str:
    """Fetch setting from multi-tier cache (<0.1ms) with DB fallback and auto-cache."""
    cache_key = f"setting:{key}"
    val = cache_service.get(cache_key)
    if val is not None:
        return str(val)
    from app.models import SystemSetting
    item = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    resolved = item.value if item and item.value is not None else default
    cache_service.set(cache_key, resolved, ttl=600)
    return resolved

def get_cached_template(db, template_key: str) -> Optional[str]:
    """Fetch WhatsApp template content from cache (<0.1ms) with DB fallback."""
    cache_key = f"template:{template_key}"
    val = cache_service.get(cache_key)
    if val is not None:
        return str(val)
    from app.models import MessageTemplate
    item = db.query(MessageTemplate).filter(MessageTemplate.template_key == template_key).first()
    if item and item.content:
        cache_service.set(cache_key, item.content, ttl=600)
        return item.content
    return None

def invalidate_setting_cache(key: Optional[str] = None):
    """Invalidate setting caches after admin mutations."""
    if key:
        cache_service.delete(f"setting:{key}")
    cache_service.invalidate_prefix("setting:")
    cache_service.delete("site_settings:public")

def invalidate_template_cache(template_key: Optional[str] = None):
    """Invalidate message template caches after admin mutations."""
    if template_key:
        cache_service.delete(f"template:{template_key}")
    cache_service.invalidate_prefix("template:")
