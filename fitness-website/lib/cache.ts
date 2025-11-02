/**
 * High-Performance Cache Layer
 * Provides instant data access with aggressive caching and background revalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
}

interface CacheOptions {
  // Time in ms before data is considered stale (default: 5 minutes)
  staleTime?: number;
  // Time in ms before cache expires completely (default: 30 minutes)
  cacheTime?: number;
  // Enable background revalidation (default: true)
  revalidateInBackground?: boolean;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  
  private defaultOptions: Required<CacheOptions> = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    revalidateInBackground: true,
  };

  /**
   * Get data from cache or fetch if needed
   * Returns cached data instantly if available (even if stale) and revalidates in background
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    const cached = this.cache.get(key);
    const now = Date.now();

    // If we have cached data
    if (cached) {
      const age = now - cached.timestamp;
      
      // If data is fresh, return it immediately
      if (age < opts.staleTime) {
        return cached.data;
      }
      
      // If data is stale but within cache time
      if (age < opts.cacheTime) {
        // Return stale data immediately
        const staleData = cached.data;
        
        // Revalidate in background if enabled
        if (opts.revalidateInBackground && !cached.loading) {
          this.revalidateInBackground(key, fetcher);
        }
        
        return staleData;
      }
    }

    // No valid cache, fetch fresh data
    return this.fetchAndCache(key, fetcher);
  }

  /**
   * Fetch data and update cache
   */
  private async fetchAndCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Mark as loading
    const cached = this.cache.get(key);
    if (cached) {
      cached.loading = true;
    }

    // Create new request
    const request = fetcher()
      .then((data) => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          loading: false,
        });
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        if (cached) {
          cached.loading = false;
        }
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Revalidate data in background without blocking
   */
  private revalidateInBackground<T>(key: string, fetcher: () => Promise<T>): void {
    const cached = this.cache.get(key);
    if (!cached || cached.loading) return;

    cached.loading = true;
    
    fetcher()
      .then((data) => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          loading: false,
        });
      })
      .catch(() => {
        // Keep stale data on error
        if (cached) {
          cached.loading = false;
        }
      });
  }

  /**
   * Manually invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Prefetch data and store in cache
   */
  async prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      await this.fetchAndCache(key, fetcher);
    } catch {
      // Ignore prefetch errors
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const { cacheTime } = this.defaultOptions;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > cacheTime) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const dataCache = new DataCache();

// Cleanup expired entries every 10 minutes (optimized for performance)
if (typeof window !== 'undefined') {
  setInterval(() => dataCache.cleanup(), 10 * 60 * 1000);
}
