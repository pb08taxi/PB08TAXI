import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * High-performance In-Memory Smart Cache for PB08 TAXI Admin Panel.
 * Implements Stale-While-Revalidate (SWR):
 * 1. Cache hit & fresh: returns immediately (0ms).
 * 2. Cache hit & stale: returns cached data immediately (0ms), triggers silent background revalidation.
 * 3. Cache miss: fetches over network, stores in cache.
 */

class SmartCacheStore {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const now = Date.now();
    const isStale = now - entry.timestamp > entry.ttl;
    return {
      data: entry.data,
      timestamp: entry.timestamp,
      isStale,
    };
  }

  set(key, data, ttl = 3 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.notify(key, data);
  }

  mutate(key, updater) {
    const entry = this.cache.get(key);
    let newData;
    if (typeof updater === 'function') {
      newData = updater(entry ? entry.data : undefined);
    } else {
      newData = updater;
    }
    this.set(key, newData, entry ? entry.ttl : 3 * 60 * 1000);
    return newData;
  }

  invalidate(keyPattern) {
    if (!keyPattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPattern) || key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  notify(key, data) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach((cb) => cb(data));
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const adminCache = new SmartCacheStore();

/**
 * Custom React Hook for caching and background revalidation
 * @param {string} key - Cache identifier
 * @param {Function} fetcher - Async data fetching function
 * @param {Object} options - { ttl, enabled, onSuccess, onError }
 */
export function useAdminQuery(key, fetcher, options = {}) {
  const {
    ttl = 3 * 60 * 1000, // 3 minutes default TTL
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const cached = adminCache.get(key);

  const [data, setData] = useState(() => (cached ? cached.data : null));
  const [loading, setLoading] = useState(() => !cached && enabled);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Listen for external mutations to this cache key
  useEffect(() => {
    if (!key) return;
    const unsubscribe = adminCache.subscribe(key, (updatedData) => {
      setData(updatedData);
    });
    return unsubscribe;
  }, [key]);

  const executeFetch = useCallback(
    async (isBackground = false) => {
      if (!enabled || !fetcherRef.current) return;

      if (!isBackground) {
        setLoading(true);
      } else {
        setIsRevalidating(true);
      }
      setError(null);

      try {
        const freshData = await fetcherRef.current();
        adminCache.set(key, freshData, ttl);
        setData(freshData);
        if (onSuccessRef.current) onSuccessRef.current(freshData);
        return freshData;
      } catch (err) {
        console.error(`[AdminCache] Error fetching key "${key}":`, err);
        setError(err);
        if (onErrorRef.current) onErrorRef.current(err);
      } finally {
        setLoading(false);
        setIsRevalidating(false);
      }
    },
    [key, enabled, ttl]
  );

  useEffect(() => {
    if (!enabled || !key) return;

    const currentCached = adminCache.get(key);
    if (!currentCached) {
      // Complete cache miss: fetch with full loading indicator
      executeFetch(false);
    } else {
      // Cache hit: instantly populate state
      setData(currentCached.data);
      setLoading(false);

      // If stale, revalidate silently in the background
      if (currentCached.isStale) {
        executeFetch(true);
      }
    }
  }, [key, enabled, executeFetch]);

  // Force manual refresh (bypasses cache)
  const refresh = useCallback(() => {
    adminCache.invalidate(key);
    return executeFetch(false);
  }, [key, executeFetch]);

  // Mutate locally & update cache
  const mutate = useCallback(
    (updater) => {
      const updated = adminCache.mutate(key, updater);
      setData(updated);
      return updated;
    },
    [key]
  );

  return {
    data,
    loading,
    isRevalidating,
    error,
    refresh,
    mutate,
    setData,
  };
}
