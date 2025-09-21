import { getSupabaseClient } from './supabase';
import { cacheUtils, CacheKeys, withCache } from './cache';

// Database connection pool and optimization utilities
export class DatabaseService {
  private static instance: DatabaseService;
  private connectionPool: Map<string, any> = new Map();
  private queryCache = new Map<string, { data: any; timestamp: number }>();

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Optimized order creation with connection pooling
  async createOrder(orderData: any): Promise<{ data: any; error: any }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: null, error: new Error('Database connection failed') };
    }

    try {
      // Use transaction-like approach for data consistency
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating order:', error);
        return { data: null, error };
      }

      // Invalidate related cache entries
      cacheUtils.invalidateOrders();
      
      // Cache the new order
      if (data?.id) {
        cacheUtils.set(CacheKeys.order(data.id), data, 600000); // 10 minutes
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error creating order:', error);
      return { data: null, error };
    }
  }

  // Optimized order retrieval with caching
  async getOrders(limit: number = 50, offset: number = 0): Promise<{ data: any[]; error: any }> {
    const cacheKey = CacheKeys.orders(limit, offset);
    
    return withCache(cacheKey, async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection failed');
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Database error fetching orders:', error);
        throw error;
      }

      return data || [];
    }, 300000); // 5 minutes cache
  }

  // Get single order with caching
  async getOrder(id: string): Promise<{ data: any; error: any }> {
    const cacheKey = CacheKeys.order(id);
    
    try {
      const data = await withCache(cacheKey, async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Database connection failed');
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Database error fetching order:', error);
          throw error;
        }

        return data;
      }, 600000); // 10 minutes cache

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user orders with caching
  async getUserOrders(phone: string): Promise<{ data: any[]; error: any }> {
    const cacheKey = CacheKeys.userOrders(phone);
    
    try {
      const data = await withCache(cacheKey, async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Database connection failed');
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('phone', phone)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Database error fetching user orders:', error);
          throw error;
        }

        return data || [];
      }, 300000); // 5 minutes cache

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get order statistics with caching
  async getOrderStats(): Promise<{ data: any; error: any }> {
    const cacheKey = CacheKeys.stats();
    
    try {
      const data = await withCache(cacheKey, async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Database connection failed');
        }

        // Get total orders count
        const { count: totalOrders, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Database error fetching order count:', countError);
          throw countError;
        }

        // Get today's orders count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: todayOrders, error: todayError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        if (todayError) {
          console.error('Database error fetching today orders:', todayError);
          throw todayError;
        }

        // Get pending orders count
        const { count: pendingOrders, error: pendingError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'pending_cod']);

        if (pendingError) {
          console.error('Database error fetching pending orders:', pendingError);
          throw pendingError;
        }

        return {
          totalOrders: totalOrders || 0,
          todayOrders: todayOrders || 0,
          pendingOrders: pendingOrders || 0,
          lastUpdated: new Date().toISOString()
        };
      }, 60000); // 1 minute cache

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update order status
  async updateOrderStatus(id: string, status: string): Promise<{ data: any; error: any }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: null, error: new Error('Database connection failed') };
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database error updating order:', error);
        return { data: null, error };
      }

      // Invalidate related cache entries
      cacheUtils.invalidateOrders();
      cacheUtils.delete(CacheKeys.order(id));

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error updating order:', error);
      return { data: null, error };
    }
  }

  // Batch operations for better performance
  async batchUpdateOrders(updates: Array<{ id: string; status: string }>): Promise<{ data: any; error: any }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: null, error: new Error('Database connection failed') };
    }

    try {
      // Process updates in batches of 10
      const batchSize = 10;
      const results = [];

      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        const batchPromises = batch.map(update => 
          supabase
            .from('orders')
            .update({ 
              status: update.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', update.id)
            .select()
            .single()
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Batch update errors:', errors);
        return { data: null, error: errors[0].error };
      }

      // Invalidate cache
      cacheUtils.invalidateOrders();

      return { data: results.map(r => r.data), error: null };
    } catch (error) {
      console.error('Unexpected error in batch update:', error);
      return { data: null, error };
    }
  }

  // Health check with connection testing
  async healthCheck(): Promise<{ data: any; error: any }> {
    const cacheKey = CacheKeys.health();
    
    try {
      const data = await withCache(cacheKey, async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Database connection failed');
        }

        // Test connection with a simple query
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .limit(1);

        if (error) {
          throw error;
        }

        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          connection: 'active'
        };
      }, 30000); // 30 seconds cache

      return { data, error: null };
    } catch (error) {
      return { 
        data: { 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 
        error 
      };
    }
  }

  // Cleanup method
  cleanup(): void {
    this.connectionPool.clear();
    this.queryCache.clear();
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Connection pool utilities
export const connectionUtils = {
  // Get connection from pool
  getConnection: (key: string) => {
    const db = DatabaseService.getInstance();
    return db['connectionPool'].get(key);
  },
  
  // Add connection to pool
  addConnection: (key: string, connection: any) => {
    const db = DatabaseService.getInstance();
    db['connectionPool'].set(key, connection);
  },
  
  // Remove connection from pool
  removeConnection: (key: string) => {
    const db = DatabaseService.getInstance();
    db['connectionPool'].delete(key);
  },
  
  // Clear all connections
  clearConnections: () => {
    const db = DatabaseService.getInstance();
    db['connectionPool'].clear();
  }
};
