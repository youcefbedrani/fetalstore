import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ecommerce-store' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Logging functions for different types of events
export const logOrder = {
  created: (orderId: string, ip: string, details: Record<string, unknown>) => {
    logger.info('Order created', {
      event: 'order_created',
      orderId,
      ip,
      details,
      timestamp: new Date().toISOString()
    });
  },

  blocked: (ip: string, reason: string, details: Record<string, unknown>) => {
    logger.warn('Order blocked', {
      event: 'order_blocked',
      ip,
      reason,
      details,
      timestamp: new Date().toISOString()
    });
  },

  failed: (ip: string, error: string, details: Record<string, unknown>) => {
    logger.error('Order creation failed', {
      event: 'order_failed',
      ip,
      error,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

export const logIP = {
  blocked: (ip: string, reason: string, cloudflareRuleId?: string) => {
    logger.warn('IP blocked', {
      event: 'ip_blocked',
      ip,
      reason,
      cloudflareRuleId,
      timestamp: new Date().toISOString()
    });
  },

  unblocked: (ip: string, adminAction: boolean = false) => {
    logger.info('IP unblocked', {
      event: 'ip_unblocked',
      ip,
      adminAction,
      timestamp: new Date().toISOString()
    });
  },

  limitExceeded: (ip: string, orderCount: number) => {
    logger.warn('IP rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      orderCount,
      timestamp: new Date().toISOString()
    });
  }
};

export const logSecurity = {
  suspiciousActivity: (ip: string, activity: string, details: Record<string, unknown>) => {
    logger.warn('Suspicious activity detected', {
      event: 'suspicious_activity',
      ip,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  },

  adminAction: (action: string, adminId: string, details: Record<string, unknown>) => {
    logger.info('Admin action performed', {
      event: 'admin_action',
      action,
      adminId,
      details,
      timestamp: new Date().toISOString()
    });
  },

  authenticationFailed: (ip: string, reason: string) => {
    logger.warn('Authentication failed', {
      event: 'auth_failed',
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  }
};

export const logSystem = {
  startup: (version: string, environment: string) => {
    logger.info('System startup', {
      event: 'system_startup',
      version,
      environment,
      timestamp: new Date().toISOString()
    });
  },

  shutdown: (reason: string) => {
    logger.info('System shutdown', {
      event: 'system_shutdown',
      reason,
      timestamp: new Date().toISOString()
    });
  },

  error: (error: Error, context?: Record<string, unknown>) => {
    logger.error('System error', {
      event: 'system_error',
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }
};

export const logCloudflare = {
  ruleCreated: (ip: string, ruleId: string) => {
    logger.info('Cloudflare rule created', {
      event: 'cloudflare_rule_created',
      ip,
      ruleId,
      timestamp: new Date().toISOString()
    });
  },

  ruleDeleted: (ip: string, ruleId: string) => {
    logger.info('Cloudflare rule deleted', {
      event: 'cloudflare_rule_deleted',
      ip,
      ruleId,
      timestamp: new Date().toISOString()
    });
  },

  apiError: (operation: string, error: string, details: Record<string, unknown>) => {
    logger.error('Cloudflare API error', {
      event: 'cloudflare_api_error',
      operation,
      error,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance logging
export const logPerformance = {
  slowQuery: (query: string, duration: number, details: Record<string, unknown>) => {
    logger.warn('Slow database query', {
      event: 'slow_query',
      query,
      duration,
      details,
      timestamp: new Date().toISOString()
    });
  },

  highMemoryUsage: (usage: number, threshold: number) => {
    logger.warn('High memory usage detected', {
      event: 'high_memory_usage',
      usage,
      threshold,
      timestamp: new Date().toISOString()
    });
  }
};

export default logger;
