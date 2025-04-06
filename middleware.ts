import { NextRequest, NextResponse } from 'next/server';
import env from '@/lib/env';

// Domain to directory slug mapping
// This allows us to serve different directory content based on the domain
export const domainMap: Record<string, string> = {
  'notaryfindernow.com': 'notary',
  'notary.localhost': 'notary',
  'notary.localhost:3003': 'notary',
  'notary.localhost:3004': 'notary',
  'passporthelpnow.com': 'passport',
  'passport.localhost': 'passport',
  'passport.localhost:3003': 'passport',
  'passport.localhost:3004': 'passport',
  'localhost:3003': 'platform', // Default for local development
  'localhost:3004': 'platform', // Default for local development
  'nowdirectories.com': 'platform', // Main aggregator site
};

// Middleware to set directory slug based on the domain
export function middleware(request: NextRequest) {
  // Get the hostname from the request
  const host = request.headers.get('host') || '';
  
  // Find the matching directory slug or use default from environment
  const directorySlug = domainMap[host] || env.DEFAULT_DIRECTORY_SLUG;
  
  // Clone the request headers to modify them
  const requestHeaders = new Headers(request.headers);
  
  // Set the directory slug as a header so we can access it in our app
  requestHeaders.set('x-directory-slug', directorySlug);
  
  // Create a response object to modify
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Also set a cookie with the host for auth contexts where headers aren't accessible
  // This allows our auth functions to still know which directory we're in
  response.cookies.set('x-host', host, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
    // Short expiry as this is just for the current session
    maxAge: 60 * 60 * 24, // 1 day
  });
  
  return response;
}

// Configure the middleware to run on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
