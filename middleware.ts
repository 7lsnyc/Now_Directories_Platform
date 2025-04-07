import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { addSecurityHeaders, applyCorsPolicies, validateInput } from '@/lib/security/securityMiddleware';

/**
 * Directory information retrieved from Supabase
 * Contains essential data needed for middleware routing and tenant identification
 */
interface DirectoryInfo {
  /** Unique slug identifier for the directory */
  directory_slug: string;
  /** Domain associated with this directory */
  domain: string;
  /** Primary brand color for the directory */
  brand_color_primary: string;
}

/**
 * In-memory cache for directory info to reduce database calls
 * This is cleared on cold starts, which is acceptable for our use case
 * Helps reduce Supabase database load and improves response times
 */
const DIRECTORY_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Structure for cached directory entries
 * Includes timestamp for TTL-based cache invalidation
 */
interface CacheEntry {
  /** The cached directory data or null if not found */
  data: DirectoryInfo | null;
  /** Timestamp when this entry was cached */
  timestamp: number;
}

/**
 * Multi-tenant middleware for the Now Directories Platform
 * 
 * Core routing logic for the entire platform that:
 * 1. Determines which directory/tenant a request is for based on hostname or path
 * 2. Routes requests to the appropriate directory in the app/directory/[slug] structure
 * 3. Adds security headers to all responses
 * 4. Implements caching to reduce database load
 * 5. Handles error cases and provides appropriate redirects
 * 
 * All directory/tenant identification uses Supabase as the source of truth.
 * No local fallbacks are implemented to ensure consistency across environments.
 * 
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} The response with proper routing and headers
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
    
    // For development environments, use Supabase to lookup directories
    // This ensures consistency between development and production
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Extract potential directory slug from the URL path
      const pathParts = pathname.split('/').filter(Boolean);
      const potentialSlug = pathParts[0];
      
      if (potentialSlug) {
        // Validate the slug
        const validatedSlug = validateInput(potentialSlug, 'slug');
        
        if (validatedSlug) {
          // Look up the directory in Supabase to verify it exists
          const supabase = createClient(request);
          
          try {
            const { data, error } = await supabase
              .from('directories')
              .select('directory_slug, domain, brand_color_primary')
              .eq('directory_slug', validatedSlug)
              .eq('is_active', true)
              .maybeSingle();
            
            if (!error && data) {
              // Directory exists in database - rewrite to the correct path
              const newPath = pathname.replace(`/${potentialSlug}`, '') || '/';
              const targetUrl = new URL(`/directory/${validatedSlug}${newPath}`, request.url);
              
              const dirResponse = NextResponse.rewrite(targetUrl);
              response = addSecurityHeaders(dirResponse);
              response = applyCorsPolicies(request, dirResponse);
              
              // Set directory headers
              response.headers.set('x-directory-slug', validatedSlug);
              response.headers.set('x-directory-domain', data.domain);
              response.headers.set('x-directory-color', data.brand_color_primary);
              
              return response;
            }
          } catch (dbError) {
            console.error('Database query error:', dbError instanceof Error ? dbError.message : 'Unknown error');
            // Continue with normal routing if database lookup fails
          }
        }
      }
      
      // No valid directory in path - return normal response
      return response;
    }
    
    // Default domain - serve the normal Next.js app
    if (hostname === 'nowdirectories.com' || hostname.endsWith('.vercel.app')) {
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
      
      try {
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
      } catch (dbError) {
        console.error('Database query error:', dbError instanceof Error ? dbError.message : 'Unknown error');
        return NextResponse.rewrite(new URL('/error', request.url));
      }
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

/**
 * Middleware configuration
 * Limits middleware execution to only the necessary routes for better performance
 * Excludes static files, Next.js internals, and API routes
 */
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
