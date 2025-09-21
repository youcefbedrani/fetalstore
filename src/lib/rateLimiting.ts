import { NextRequest, NextResponse } from 'next/server';
import performanceMonitor from './monitoring';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  onLimitReached?: (req: NextRequest, key: string) => void; // Callback when limit is reached
}

// Rate limit entry
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  firstRequest: number;
  lastRequest: number;
}

// In-memory rate limit store (use Redis in production)
class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  // Get rate limit entry
  get(key: string): RateLimitEntry | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  // Set rate limit entry
  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  // Increment request count
  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const existing = this.get(key);

    if (existing) {
      existing.count++;
      existing.lastRequest = now;
      this.set(key, existing);
      return existing;
    }

    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
      blocked: false,
      firstRequest: now,
      lastRequest: now,
    };

    this.set(key, newEntry);
    return newEntry;
  }

  // Block a key
  block(key: string, duration: number = 3600000): void { // Default 1 hour
    const entry = this.get(key) || {
      count: 0,
      resetTime: Date.now() + duration,
      blocked: true,
      firstRequest: Date.now(),
      lastRequest: Date.now(),
    };

    entry.blocked = true;
    entry.resetTime = Date.now() + duration;
    this.set(key, entry);
  }

  // Unblock a key
  unblock(key: string): void {
    const entry = this.get(key);
    if (entry) {
      entry.blocked = false;
      this.set(key, entry);
    }
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // Get store statistics
  getStats() {
    return {
      totalEntries: this.store.size,
      activeEntries: Array.from(this.store.values()).filter(
        entry => Date.now() <= entry.resetTime
      ).length,
    };
  }

  // Clear all entries
  clear(): void {
    this.store.clear();
  }

  // Destroy the store
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

// Default key generator (by IP)
function defaultKeyGenerator(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             req.ip || 
             'unknown';
  return `rate_limit:${ip}`;
}

// Rate limiting middleware
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = defaultKeyGenerator,
    onLimitReached,
  } = config;

  return async (req: NextRequest, handler: () => Promise<Response>): Promise<Response> => {
    const key = keyGenerator(req);
    const entry = rateLimitStore.increment(key, windowMs);

    // Check if key is blocked
    if (entry.blocked) {
      performanceMonitor.recordError(
        `Rate limit blocked: ${key}`,
        'medium',
        { key, entry }
      );

      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((entry.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
            'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
          },
        }
      );
    }

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      // Block the key for the window duration
      rateLimitStore.block(key, windowMs);

      // Call limit reached callback
      if (onLimitReached) {
        onLimitReached(req, key);
      }

      performanceMonitor.recordError(
        `Rate limit exceeded: ${key}`,
        'high',
        { key, count: entry.count, maxRequests }
      );

      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((entry.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
          },
        }
      );
    }

    // Execute handler
    const startTime = Date.now();
    let response: Response;

    try {
      response = await handler();
    } catch (error) {
      // Don't count failed requests if configured
      if (skipFailedRequests) {
        const failedEntry = rateLimitStore.get(key);
        if (failedEntry && failedEntry.count > 0) {
          failedEntry.count--;
          rateLimitStore.set(key, failedEntry);
        }
      }

      throw error;
    }

    // Don't count successful requests if configured
    if (skipSuccessfulRequests && response.status < 400) {
      const successEntry = rateLimitStore.get(key);
      if (successEntry && successEntry.count > 0) {
        successEntry.count--;
        rateLimitStore.set(key, successEntry);
      }
    }

    // Add rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetTime = Math.ceil(entry.resetTime / 1000);

    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());

    return response;
  };
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict rate limit for API endpoints
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // Moderate rate limit for general API usage
  moderate: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // Lenient rate limit for public endpoints
  lenient: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // Order-specific rate limit (3 orders per day per IP)
  orders: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 3,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    onLimitReached: (req: NextRequest, key: string) => {
      console.warn(`Order limit exceeded for ${key}`);
      // You could integrate with Cloudflare to block the IP
    },
  },

  // Auth-specific rate limit
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: true, // Don't count successful logins
    skipFailedRequests: false,
  },
};

// DDoS protection utilities
export const ddosProtection = {
  // Detect potential DDoS attack
  detectDDoSAttack: (req: NextRequest, entry: RateLimitEntry): boolean => {
    const now = Date.now();
    const timeWindow = now - entry.firstRequest;
    const requestsPerSecond = entry.count / (timeWindow / 1000);

    // Flag as potential DDoS if more than 10 requests per second
    return requestsPerSecond > 10;
  },

  // Block IP for DDoS protection
  blockForDDoS: (key: string, duration: number = 3600000): void => { // Default 1 hour
    rateLimitStore.block(key, duration);
    console.warn(`IP blocked for DDoS: ${key} for ${duration}ms`);
  },

  // Enhanced rate limiting with DDoS protection
  createDDoSProtectedRateLimit: (config: RateLimitConfig) => {
    return createRateLimit({
      ...config,
      onLimitReached: (req: NextRequest, key: string) => {
        const entry = rateLimitStore.get(key);
        if (entry && ddosProtection.detectDDoSAttack(req, entry)) {
          ddosProtection.blockForDDoS(key);
        }
        
        if (config.onLimitReached) {
          config.onLimitReached(req, key);
        }
      },
    });
  },
};

// Rate limiting utilities
export const rateLimitUtils = {
  // Get rate limit store
  getStore: () => rateLimitStore,

  // Get rate limit statistics
  getStats: () => rateLimitStore.getStats(),

  // Manually block a key
  blockKey: (key: string, duration?: number) => rateLimitStore.block(key, duration),

  // Manually unblock a key
  unblockKey: (key: string) => rateLimitStore.unblock(key),

  // Clear all rate limits
  clearAll: () => rateLimitStore.clear(),

  // Create custom rate limit
  create: createRateLimit,

  // Predefined configurations
  configs: rateLimitConfigs,
};

export default rateLimitStore;
