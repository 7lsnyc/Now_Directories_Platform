import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { addSecurityHeaders, applyCorsPolicies, validateInput } from '@/lib/security/securityMiddleware';

// Types
interface DirectoryInfo {
  directory_slug: string;
  domain: string;
  brand_color_primary: string;
}

// In-memory cache for directory info to reduce database calls
// This is cleared on cold starts, which is fine for our use case
const DIRECTORY_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry {
  data: DirectoryInfo | null;
  timestamp: number;
}

/**
 * Middleware for the Now Directories Platform
 * Handles domain-based routing to specific directories
 */
export async function middleware(request: NextRequest) {
  const { pathname, hostname } = new URL(request.url);
  
  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.match(/\.(ico|jpg|jpeg|png|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }
  
  try {
    // Create initial response to add security headers regardless of outcome
    let response = NextResponse.next();
    response = addSecurityHeaders(response);
    response = applyCorsPolicies(request, response);
    
    // Default domain - serve the normal Next.js app
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname === 'nowdirectories.com' || 
      hostname.endsWith('.vercel.app')
    ) {
      return response;
    }
    
    // Validate hostname before processing
    const validatedHostname = validateInput(hostname, 'domain');
    if (!validatedHostname) {
      console.warn('Invalid hostname detected:', hostname);
      return NextResponse.rewrite(new URL('/directory-not-found', request.url));
    }
    
    // Check cache first
    const now = Date.now();
    const cacheKey = validatedHostname;
    const cachedEntry = DIRECTORY_CACHE.get(cacheKey);
    
    let directoryInfo: DirectoryInfo | null = null;
    
    // Use cached value if it exists and hasn't expired
    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL)) {
      directoryInfo = cachedEntry.data;
    } else {
      // Cache miss - look up directory in Supabase
      const supabase = createClient(request);
      
      const { data, error } = await supabase
        .from('directories')
        .select('directory_slug, domain, brand_color_primary')
        .eq('domain', validatedHostname)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        // Log sanitized error without exposing sensitive details
        console.error('Error fetching directory data:', error.message);
        return NextResponse.rewrite(new URL('/error', request.url));
      }
      
      directoryInfo = data as DirectoryInfo | null;
      
      // Update cache
      DIRECTORY_CACHE.set(cacheKey, {
        data: directoryInfo,
        timestamp: now
      });
    }
    
    // If directory found, rewrite to the directory page
    if (directoryInfo) {
      // Validate directory slug before using it
      const validatedSlug = validateInput(directoryInfo.directory_slug, 'slug');
      if (!validatedSlug) {
        console.error('Invalid directory slug in database:', directoryInfo.directory_slug);
        return NextResponse.rewrite(new URL('/error', request.url));
      }
      
      // Add directory headers to the response
      const dirResponse = NextResponse.rewrite(
        new URL(`/directory/${validatedSlug}${pathname}`, request.url)
      );
      
      // Apply security headers
      response = addSecurityHeaders(dirResponse);
      response = applyCorsPolicies(request, response);
      
      // Set response headers for directory info
      response.headers.set('x-directory-slug', validatedSlug);
      response.headers.set('x-directory-domain', directoryInfo.domain);
      response.headers.set('x-directory-color', directoryInfo.brand_color_primary);
      
      return response;
    }
    
    // Directory not found - show 404 page
    return NextResponse.rewrite(new URL('/directory-not-found', request.url));
  } catch (error) {
    // Sanitize error before logging - don't expose sensitive details
    console.error('Middleware error:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    // Return generic error page, with security headers
    const errorResponse = NextResponse.rewrite(new URL('/error', request.url));
    return addSecurityHeaders(errorResponse);
  }
}

// For better performance, limit middleware to specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next (Next.js internals)
     * - api (API routes)
     * - static files like favicon.ico, images, fonts, etc.
     */
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
