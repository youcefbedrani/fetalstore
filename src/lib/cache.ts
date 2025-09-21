import { NextRequest } from 'next/server';
import { redis, cacheUtils as redisCacheUtils } from './redis';

// In-memory cache fallback for when Redis is unavailable
interface CacheEntry {
  data: any;
  expires: number;
  hits: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000; // Maximum number of entries
  private defaultTTL = 300000; // 5 minutes in milliseconds

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      hits: 0
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit counter
    entry.hits++;
    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits: entries.reduce((sum, entry) => sum + entry.hits, 0),
      averageHits: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.hits, 0) / entries.length : 0
    };
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Global fallback cache instance
const fallbackCache = new MemoryCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  fallbackCache.cleanup();
}, 300000);

// Cache key generators
export const CacheKeys = {
  orders: (limit: number, offset: number) => `orders:${limit}:${offset}`,
  order: (id: string) => `order:${id}`,
  userOrders: (phone: string) => `user_orders:${phone}`,
  stats: () => 'stats',
  health: () => 'health_check'
};

// Enhanced cache utilities with Redis primary and memory fallback
export const cacheUtils = {
  // Get cached data (Redis first, then fallback)
  async get<T = any>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (redis.isAvailable()) {
        const value = await redis.get<T>(key);
        if (value !== null) {
          return value;
        }
      }
      
      // Fallback to memory cache
      return fallbackCache.get(key);
    } catch (error) {
      console.warn('Cache get error, using fallback:', error);
      return fallbackCache.get(key);
    }
  },
  
  // Set cached data (Redis first, then fallback)
  async set(key: string, data: any, ttl?: number): Promise<boolean> {
    try {
      // Try Redis first
      if (redis.isAvailable()) {
        const ttlSeconds = ttl ? Math.ceil(ttl / 1000) : undefined;
        const success = await redis.set(key, data, ttlSeconds);
        if (success) {
          return true;
        }
      }
      
      // Fallback to memory cache
      fallbackCache.set(key, data, ttl);
      return true;
    } catch (error) {
      console.warn('Cache set error, using fallback:', error);
      fallbackCache.set(key, data, ttl);
      return true;
    }
  },
  
  // Delete cached data (both Redis and fallback)
  async delete(key: string): Promise<boolean> {
    try {
      let redisSuccess = false;
      
      // Try Redis first
      if (redis.isAvailable()) {
        redisSuccess = await redis.del(key);
      }
      
      // Also delete from fallback
      const fallbackSuccess = fallbackCache.delete(key);
      
      return redisSuccess || fallbackSuccess;
    } catch (error) {
      console.warn('Cache delete error:', error);
      return fallbackCache.delete(key);
    }
  },
  
  // Invalidate related cache entries
  async invalidateOrders(): Promise<void> {
    try {
      // Invalidate Redis patterns
      if (redis.isAvailable()) {
        await redis.delPattern('orders:*');
        await redis.delPattern('order:*');
        await redis.delPattern('user_orders:*');
      }
      
      // Invalidate fallback cache
      for (const [key] of fallbackCache['cache'].entries()) {
        if (key.startsWith('orders:') || key.startsWith('order:') || key.startsWith('user_orders:')) {
          fallbackCache.delete(key);
        }
      }
    } catch (error) {
      console.warn('Cache invalidation error:', error);
    }
  },
  
  // Get cache statistics (combined Redis and fallback)
  async getStats() {
    try {
      const fallbackStats = fallbackCache.getStats();
      
      if (redis.isAvailable()) {
        const redisInfo = await redis.info();
        return {
          type: 'redis+fallback',
          redis: {
            available: true,
            info: redisInfo ? 'Connected' : 'No info available'
          },
          fallback: fallbackStats,
          combined: {
            totalSize: fallbackStats.size,
            totalHits: fallbackStats.totalHits
          }
        };
      } else {
        return {
          type: 'fallback-only',
          redis: {
            available: false,
            info: 'Redis unavailable'
          },
          fallback: fallbackStats,
          combined: {
            totalSize: fallbackStats.size,
            totalHits: fallbackStats.totalHits
          }
        };
      }
    } catch (error) {
      console.warn('Cache stats error:', error);
      return {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: fallbackCache.getStats()
      };
    }
  },

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (redis.isAvailable()) {
        const redisHealth = await redisCacheUtils.healthCheck();
        return {
          status: redisHealth.status === 'healthy' ? 'healthy' : 'degraded',
          details: {
            redis: redisHealth,
            fallback: 'available'
          }
        };
      } else {
        return {
          status: 'degraded',
          details: {
            redis: 'unavailable',
            fallback: 'available'
          }
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
};

// Request-based caching
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000 // 5 minutes
): Promise<T> {
  // Try to get from cache first
  const cached = cacheUtils.get(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  // Fetch data and cache it
  return fetcher().then(data => {
    cacheUtils.set(key, data, ttl);
    return data;
  });
}

// Cache middleware for API routes
export function createCacheMiddleware(options: {
  ttl?: number;
  keyGenerator?: (request: NextRequest) => string;
  skipCache?: (request: NextRequest) => boolean;
} = {}) {
  const { ttl = 300000, keyGenerator, skipCache } = options;

  return async (request: NextRequest, handler: () => Promise<Response>) => {
    // Skip cache for certain requests
    if (skipCache && skipCache(request)) {
      return handler();
    }

    // Generate cache key
    const key = keyGenerator ? keyGenerator(request) : `api:${request.nextUrl.pathname}:${request.nextUrl.search}`;
    
    // Try to get from cache
    const cached = cacheUtils.get(key);
    if (cached !== null) {
      return new Response(JSON.stringify(cached), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // Execute handler and cache response
    const response = await handler();
    const responseClone = response.clone();
    
    try {
      const data = await responseClone.json();
      cacheUtils.set(key, data, ttl);
    } catch (error) {
      // If response is not JSON, don't cache
      console.warn('Failed to cache non-JSON response:', error);
    }

    // Add cache headers
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=300');
    
    return response;
  };
}

export default { redis, fallbackCache, cacheUtils };
