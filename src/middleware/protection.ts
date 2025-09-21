import { NextRequest, NextResponse } from 'next/server';

// Additional protection headers
export function addProtectionHeaders(response: NextResponse): NextResponse {
  // Disable right-click and text selection
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Disable caching for sensitive pages
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  
  // Additional security headers
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Disable MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

// Check if request is from a bot or scraper
export function isBotRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'scraper',
    'curl', 'wget', 'python', 'requests', 'urllib',
    'selenium', 'phantom', 'headless', 'automation',
    'googlebot', 'bingbot', 'slurp', 'duckduckbot',
    'baiduspider', 'yandexbot', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'whatsapp', 'telegram'
  ];
  
  return botPatterns.some(pattern => userAgent.includes(pattern));
}

// Check for suspicious behavior
export function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const accept = request.headers.get('accept') || '';
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) return true;
  
  // Check for suspicious referer patterns
  const suspiciousReferers = [
    'data:', 'javascript:', 'vbscript:', 'file:',
    'ftp:', 'gopher:', 'news:', 'nntp:'
  ];
  
  if (suspiciousReferers.some(pattern => referer.startsWith(pattern))) return true;
  
  // Check for missing accept header (common in bots)
  if (!accept || !accept.includes('text/html')) return true;
  
  return false;
}

// Rate limiting for protection endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `protection_${ip}`;
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Enhanced protection middleware
export function createProtectionMiddleware(options: {
  enableBotDetection?: boolean;
  enableSuspiciousDetection?: boolean;
  enableRateLimit?: boolean;
  maxRequests?: number;
  windowMs?: number;
} = {}) {
  const {
    enableBotDetection = true,
    enableSuspiciousDetection = true,
    enableRateLimit = true,
    maxRequests = 10,
    windowMs = 60000
  } = options;

  return (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting
    if (enableRateLimit && !checkRateLimit(ip, maxRequests, windowMs)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    
    // Bot detection
    if (enableBotDetection && isBotRequest(request)) {
      return new NextResponse('Access Denied', { status: 403 });
    }
    
    // Suspicious request detection
    if (enableSuspiciousDetection && isSuspiciousRequest(request)) {
      return new NextResponse('Access Denied', { status: 403 });
    }
    
    return NextResponse.next();
  };
}
