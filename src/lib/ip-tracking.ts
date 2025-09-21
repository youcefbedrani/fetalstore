import { getSupabaseClient } from './supabase';

export interface IPRateLimitResult {
  allowed: boolean;
  order_count?: number;
  remaining?: number;
  reset_time?: string;
  reason?: string;
  blocked_at?: string;
  blocked_reason?: string;
}

export interface ClientInfo {
  ip: string;
  userAgent: string;
  country?: string;
  rayId?: string;
}

/**
 * Extract client IP address from request headers
 * Handles Cloudflare, X-Forwarded-For, and direct connections
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Cloudflare provides the real IP in CF-Connecting-IP header
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;
  
  // Check X-Forwarded-For header (can contain multiple IPs)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP (original client)
    return xForwardedFor.split(',')[0].trim();
  }
  
  // Check X-Real-IP header
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) return xRealIP;
  
  // Fallback to connection remote address (if available)
  return '127.0.0.1'; // Default fallback
}

/**
 * Extract client information from request headers
 */
export function getClientInfo(request: Request): ClientInfo {
  const headers = request.headers;
  
  return {
    ip: getClientIP(request),
    userAgent: headers.get('user-agent') || 'Unknown',
    country: headers.get('cf-ipcountry') || undefined,
    rayId: headers.get('cf-ray') || undefined,
  };
}

/**
 * Check IP rate limit using database function
 */
export async function checkIPRateLimit(ip: string): Promise<IPRateLimitResult> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return {
      allowed: false,
      reason: 'Database connection error'
    };
  }

  try {
    const { data, error } = await supabase.rpc('check_ip_rate_limit', {
      ip_addr: ip
    });

    if (error) {
      console.error('Error checking IP rate limit:', error);
      return {
        allowed: false,
        reason: 'Database error'
      };
    }

    return data as IPRateLimitResult;
  } catch (error) {
    console.error('Exception in checkIPRateLimit:', error);
    return {
      allowed: false,
      reason: 'System error'
    };
  }
}

/**
 * Reset IP rate limits (admin function)
 */
export async function resetIPLimits(ip: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('reset_ip_limits', {
      ip_addr: ip
    });

    if (error) {
      console.error('Error resetting IP limits:', error);
      return false;
    }

    return data as boolean;
  } catch (error) {
    console.error('Exception in resetIPLimits:', error);
    return false;
  }
}

/**
 * Get IP statistics (admin function)
 */
export async function getIPStatistics() {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('get_ip_statistics');

    if (error) {
      console.error('Error getting IP statistics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getIPStatistics:', error);
    return null;
  }
}

/**
 * Get blocked IPs list (admin function)
 */
export async function getBlockedIPs(limit: number = 50, offset: number = 0) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('is_active', true)
      .order('blocked_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting blocked IPs:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getBlockedIPs:', error);
    return null;
  }
}

/**
 * Get IP tracking records (admin function)
 */
export async function getIPTrackingRecords(limit: number = 50, offset: number = 0) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('ip_tracking')
      .select('*')
      .order('last_order_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting IP tracking records:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getIPTrackingRecords:', error);
    return null;
  }
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Sanitize IP address for database storage
 */
export function sanitizeIP(ip: string): string {
  // Remove any whitespace and convert to lowercase
  const cleaned = ip.trim().toLowerCase();
  
  // Basic validation
  if (!isValidIP(cleaned)) {
    throw new Error('Invalid IP address format');
  }
  
  return cleaned;
}
