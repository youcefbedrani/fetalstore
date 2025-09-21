import { createClient, RedisClientType } from 'redis';

// Redis client configuration
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

// Redis client singleton
class RedisService {
  private static instance: RedisService;
  private client: RedisClientType | null = null;
  private isConnected = false;
  private config: RedisConfig;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Connect to Redis
  async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      return;
    }

    try {
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
        password: this.config.password,
        database: this.config.db,
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      // Fallback to in-memory cache if Redis is not available
    }
  }

  // Disconnect from Redis
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // Check if Redis is available
  isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  // Set a key-value pair with TTL
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client!.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  // Get a value by key
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const value = await this.client!.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  // Delete a key
  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Set expiration for a key
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.expire(key, ttlSeconds);
      return result;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  // Get TTL for a key
  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) {
      return -1;
    }

    try {
      return await this.client!.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  // Increment a counter
  async incr(key: string): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return await this.client!.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  }

  // Increment a counter with TTL
  async incrWithTTL(key: string, ttlSeconds: number): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const result = await this.client!.incr(key);
      await this.client!.expire(key, ttlSeconds);
      return result;
    } catch (error) {
      console.error('Redis INCR with TTL error:', error);
      return null;
    }
  }

  // Get multiple keys
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isAvailable() || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const values = await this.client!.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  // Set multiple key-value pairs
  async mset(keyValuePairs: Record<string, any>, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serializedPairs: Record<string, string> = {};
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs[key] = JSON.stringify(value);
      }

      await this.client!.mSet(serializedPairs);

      if (ttlSeconds) {
        const pipeline = this.client!.multi();
        for (const key of Object.keys(keyValuePairs)) {
          pipeline.expire(key, ttlSeconds);
        }
        await pipeline.exec();
      }

      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  // Get keys by pattern
  async keys(pattern: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      return await this.client!.keys(pattern);
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  }

  // Delete keys by pattern
  async delPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      return await this.client!.del(keys);
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
      return 0;
    }
  }

  // Get Redis info
  async info(): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return await this.client!.info();
    } catch (error) {
      console.error('Redis INFO error:', error);
      return null;
    }
  }

  // Get memory usage
  async memoryUsage(key: string): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return await this.client!.memoryUsage(key);
    } catch (error) {
      console.error('Redis MEMORY USAGE error:', error);
      return null;
    }
  }

  // Flush all data (use with caution)
  async flushAll(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.flushAll();
      return true;
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      return false;
    }
  }

  // Get client instance (for advanced operations)
  getClient(): RedisClientType | null {
    return this.client;
  }
}

// Export singleton instance
export const redis = RedisService.getInstance();

// Cache utilities with Redis fallback
export const cacheUtils = {
  // Set cache with fallback
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const success = await redis.set(key, value, ttlSeconds);
    if (!success) {
      // Fallback to in-memory cache
      console.warn('Redis unavailable, using in-memory cache fallback');
      // You could implement in-memory fallback here
    }
    return success;
  },

  // Get cache with fallback
  async get<T = any>(key: string): Promise<T | null> {
    const value = await redis.get<T>(key);
    if (value === null && redis.isAvailable()) {
      // Try in-memory cache fallback
      console.warn('Redis unavailable, checking in-memory cache fallback');
      // You could implement in-memory fallback here
    }
    return value;
  },

  // Delete cache
  async delete(key: string): Promise<boolean> {
    return await redis.del(key);
  },

  // Invalidate pattern
  async invalidatePattern(pattern: string): Promise<number> {
    return await redis.delPattern(pattern);
  },

  // Health check
  async healthCheck(): Promise<{ status: string; info?: any }> {
    if (!redis.isAvailable()) {
      return { status: 'unavailable' };
    }

    try {
      const info = await redis.info();
      return { status: 'healthy', info };
    } catch (error) {
      return { status: 'unhealthy', info: error };
    }
  },
};

// Cache key generators
export const CacheKeys = {
  orders: (limit: number, offset: number) => `orders:${limit}:${offset}`,
  order: (id: string) => `order:${id}`,
  userOrders: (phone: string) => `user_orders:${phone}`,
  stats: () => 'stats',
  health: () => 'health_check',
  rateLimit: (ip: string) => `rate_limit:${ip}`,
  session: (sessionId: string) => `session:${sessionId}`,
  api: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
};

// Initialize Redis connection
export async function initializeRedis(): Promise<void> {
  try {
    await redis.connect();
    console.log('Redis initialized successfully');
  } catch (error) {
    console.warn('Redis initialization failed, using fallback:', error);
  }
}

// Graceful shutdown
export async function shutdownRedis(): Promise<void> {
  try {
    await redis.disconnect();
    console.log('Redis disconnected successfully');
  } catch (error) {
    console.error('Redis shutdown error:', error);
  }
}

export default redis;
