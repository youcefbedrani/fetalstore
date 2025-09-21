import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { cacheUtils } from '@/lib/cache';
import { getCloudflareConfig } from '@/lib/cloudflare';

export async function GET() {
  const startTime = Date.now();
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        database: 'unknown',
        cloudflare: 'unknown',
        cache: 'unknown',
      },
      metrics: {
        responseTime: 0,
        memoryUsage: process.memoryUsage(),
      }
    };

    // Check database connectivity using optimized service
    try {
      const { data: dbHealth, error: dbError } = await db.healthCheck();
      health.services.database = dbError ? 'unhealthy' : 'healthy';
      health.services.databaseDetails = dbHealth;
    } catch (error) {
      health.services.database = 'unhealthy';
      console.error('Database health check failed:', error);
    }

    // Check cache system
    try {
      const cacheStats = cacheUtils.getStats();
      health.services.cache = 'healthy';
      health.services.cacheStats = cacheStats;
    } catch (error) {
      health.services.cache = 'unhealthy';
      console.error('Cache health check failed:', error);
    }

    // Check Cloudflare configuration
    try {
      const cloudflareConfig = getCloudflareConfig();
      health.services.cloudflare = cloudflareConfig ? 'configured' : 'not_configured';
    } catch (error) {
      health.services.cloudflare = 'error';
      console.error('Cloudflare health check failed:', error);
    }

    // Calculate response time
    health.metrics.responseTime = Date.now() - startTime;

    // Determine overall health status
    const isHealthy = 
      health.services.database === 'healthy' && 
      health.metrics.responseTime < 5000; // Less than 5 seconds

    health.status = isHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(health, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: Date.now() - startTime,
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
