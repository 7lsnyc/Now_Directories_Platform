import { NextRequest, NextResponse } from 'next/server';

// Domain to directory slug mapping
// This allows us to serve different directory content based on the domain
export const domainMap: Record<string, string> = {
  'notaryfindernow.com': 'notary',
  'notary.localhost': 'notary',
  'notary.localhost:3003': 'notary',
  'passporthelpnow.com': 'passport',
  'passport.localhost': 'passport',
  'passport.localhost:3003': 'passport',
  'localhost:3003': 'platform', // Default for local development
  'nowdirectories.com': 'platform', // Main aggregator site
};

// Middleware to set directory slug based on the domain
export function middleware(request: NextRequest) {
  // Get the hostname from the request
  const host = request.headers.get('host') || '';
  
  // Find the matching directory slug or use 'platform' as default
  const directorySlug = domainMap[host] || 'platform';
  
  // Clone the request headers to modify them
  const requestHeaders = new Headers(request.headers);
  
  // Set the directory slug as a header so we can access it in our app
  requestHeaders.set('x-directory-slug', directorySlug);
  
  // Return the response with the modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
