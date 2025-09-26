import { NextRequest, NextResponse } from 'next/server';
import { addProtectionHeaders } from './middleware/protection';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add protection headers
  addProtectionHeaders(response);

  // NO SECURITY HEADERS - ALLOW EVERYTHING FOR PIXEL
  // Removed all CSP and security headers to allow Facebook pixel

  // Rate limiting headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Add rate limiting headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString());
  }

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://yourdomain.com', // Replace with your actual domain
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
