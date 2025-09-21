import { NextRequest, NextResponse } from 'next/server';

// Performance monitoring utilities
interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  requestCount: number;
  errorCount: number;
  cacheHitRate: number;
}

interface ErrorLog {
  timestamp: number;
  error: string;
  stack?: string;
  requestId?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private errors: ErrorLog[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();
  private maxMetricsHistory = 1000;
  private maxErrorHistory = 500;

  // Record performance metrics
  recordMetrics(duration: number, cacheHitRate: number = 0): void {
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      duration,
      memoryUsage: process.memoryUsage(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      cacheHitRate,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  // Record error
  recordError(
    error: Error | string,
    severity: ErrorLog['severity'] = 'medium',
    context?: Record<string, any>
  ): void {
    this.errorCount++;

    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      severity,
      context,
    };

    this.errors.push(errorLog);

    // Keep only recent errors
    if (this.errors.length > this.maxErrorHistory) {
      this.errors = this.errors.slice(-this.maxErrorHistory);
    }

    // Log critical errors to console
    if (severity === 'critical') {
      console.error('Critical error:', errorLog);
    }
  }

  // Increment request count
  incrementRequestCount(): void {
    this.requestCount++;
  }

  // Get current metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  // Get performance summary
  getPerformanceSummary(): {
    uptime: number;
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: NodeJS.MemoryUsage;
    recentErrors: ErrorLog[];
  } {
    const uptime = Date.now() - this.startTime;
    const averageResponseTime = this.metrics.length > 0
      ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length
      : 0;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const recentErrors = this.errors.slice(-10); // Last 10 errors

    return {
      uptime,
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      averageResponseTime,
      errorRate,
      memoryUsage: process.memoryUsage(),
      recentErrors,
    };
  }

  // Get metrics history
  getMetricsHistory(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  // Get error history
  getErrorHistory(limit: number = 50): ErrorLog[] {
    return this.errors.slice(-limit);
  }

  // Clear old data
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.errors = this.errors.filter(e => e.timestamp > cutoff);
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Cleanup old data every hour
setInterval(() => {
  performanceMonitor.cleanup();
}, 60 * 60 * 1000);

// Performance monitoring middleware
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now();
    performanceMonitor.incrementRequestCount();

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      
      // Extract cache hit information from response headers
      const cacheStatus = response.headers.get('X-Cache');
      const cacheHitRate = cacheStatus === 'HIT' ? 1 : 0;
      
      performanceMonitor.recordMetrics(duration, cacheHitRate);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordMetrics(duration, 0);
      performanceMonitor.recordError(
        error instanceof Error ? error : String(error),
        'high'
      );
      throw error;
    }
  };
}

// Error tracking utilities
export const errorTracker = {
  // Track client-side errors
  trackClientError: (error: Error, context?: Record<string, any>) => {
    // In a real application, you'd send this to an error tracking service
    console.error('Client error:', error, context);
    
    // You could send to external service like Sentry, LogRocket, etc.
    if (typeof window !== 'undefined') {
      // Example: Send to analytics service
      // analytics.track('error', { error: error.message, context });
    }
  },

  // Track API errors
  trackApiError: (
    error: Error,
    request: NextRequest,
    context?: Record<string, any>
  ) => {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      requestId: request.headers.get('x-request-id') || undefined,
      severity: 'medium',
      context: {
        ...context,
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      },
    };

    performanceMonitor.recordError(error, 'medium', errorLog.context);
  },

  // Track performance issues
  trackPerformanceIssue: (
    issue: string,
    duration: number,
    context?: Record<string, any>
  ) => {
    const severity: ErrorLog['severity'] = duration > 5000 ? 'high' : 'medium';
    
    performanceMonitor.recordError(
      `Performance issue: ${issue} (${duration}ms)`,
      severity,
      { ...context, duration }
    );
  },
};

// Performance utilities
export const performanceUtils = {
  // Measure function execution time
  measure: async <T>(fn: () => Promise<T>, label?: string): Promise<T> => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      if (label) {
        console.log(`${label} took ${duration}ms`);
      }
      
      if (duration > 1000) {
        performanceMonitor.recordError(
          `Slow operation: ${label || 'unnamed'} (${duration}ms)`,
          'medium',
          { duration, label }
        );
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      performanceMonitor.recordError(
        error instanceof Error ? error : String(error),
        'high',
        { duration, label }
      );
      throw error;
    }
  },

  // Get performance monitor instance
  getMonitor: () => performanceMonitor,

  // Get current performance summary
  getSummary: () => performanceMonitor.getPerformanceSummary(),

  // Get metrics for monitoring dashboard
  getMetrics: () => ({
    current: performanceMonitor.getCurrentMetrics(),
    summary: performanceMonitor.getPerformanceSummary(),
    history: performanceMonitor.getMetricsHistory(50),
    errors: performanceMonitor.getErrorHistory(20),
  }),
};

// Request ID middleware
export function addRequestId(request: NextRequest): string {
  const requestId = request.headers.get('x-request-id') || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return requestId;
}

// Performance headers middleware
export function addPerformanceHeaders(response: NextResponse, startTime: number): NextResponse {
  const duration = Date.now() - startTime;
  
  response.headers.set('X-Response-Time', `${duration}ms`);
  response.headers.set('X-Request-ID', addRequestId(request as NextRequest));
  
  // Add performance warnings
  if (duration > 2000) {
    response.headers.set('X-Performance-Warning', 'slow-response');
  }
  
  return response;
}

export default performanceMonitor;
