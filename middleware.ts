import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { addSecurityHeaders, applyCorsPolicies, validateInput } from '@/lib/security/securityMiddleware';
import { environmentService } from '@/lib/services/EnvironmentService';

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
 * Domain mapping object that can be imported by other modules
 * Maps custom domains to directory slugs
 */
export const domainMap = new Map<string, string>();

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
  
  console.log(`[Middleware] Processing request: ${hostname}${pathname}`);
  
  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.match(/\.(ico|jpg|jpeg|png|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }
  
  try {
    // Initialize environment service
    try {
      environmentService.initialize();
    } catch (envError) {
      console.error('[Middleware] Environment initialization failed:', 
        envError instanceof Error ? envError.message : 'Unknown error');
      return NextResponse.rewrite(new URL('/error', request.url));
    }
    
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
      
      console.log(`[Middleware] Local development path: ${pathname}, potential slug: ${potentialSlug}`);
      
      if (potentialSlug) {
        // Check if the URL is already using the /directory/{slug} pattern
        if (potentialSlug === 'directory' && pathParts.length > 1) {
          // If the path is /directory/{slug}/..., use the second path part as the slug
          const directorySlug = pathParts[1];
          console.log(`[Middleware] Detected directory path format, using slug: ${directorySlug}`);
          
          // Validate the slug
          const validatedSlug = validateInput(directorySlug, 'slug');
          
          if (validatedSlug) {
            // Look up the directory in Supabase to verify it exists
            const supabase = createClient(request);
            
            try {
              console.log(`[Middleware] Looking up directory slug in Supabase: ${validatedSlug}`);
              
              const { data, error } = await supabase
                .from('directories')
                .select('directory_slug, domain, brand_color_primary')
                .eq('directory_slug', validatedSlug)
                .eq('is_active', true)
                .maybeSingle();
              
              if (error) {
                console.error(`[Middleware] Supabase error for slug ${validatedSlug}:`, error.message);
              } else if (!data) {
                console.warn(`[Middleware] No directory found in database for slug: ${validatedSlug}`);
              }
              
              if (!error && data) {
                // Directory exists in database - rewrite to the correct path
                const newPath = pathname.replace(`/${potentialSlug}/${directorySlug}`, '') || '/';
                const targetUrl = new URL(`/directory/${validatedSlug}${newPath}`, request.url);
                
                console.log(`[Middleware] Rewriting to: ${targetUrl.pathname}`);
                
                const dirResponse = NextResponse.rewrite(targetUrl);
                response = addSecurityHeaders(dirResponse);
                response = applyCorsPolicies(request, dirResponse);
                
                // Set directory headers
                response.headers.set('x-directory-slug', validatedSlug);
                if (data.domain) {
                  response.headers.set('x-directory-domain', data.domain);
                }
                if (data.brand_color_primary) {
                  response.headers.set('x-directory-color', data.brand_color_primary);
                }
                
                return response;
              }
            } catch (dbError) {
              console.error(`[Middleware] Database error for slug ${validatedSlug}:`, 
                dbError instanceof Error ? dbError.message : 'Unknown error');
            }
          }
        } else {
          // Validate the slug
          const validatedSlug = validateInput(potentialSlug, 'slug');
          
          if (validatedSlug) {
            // Look up the directory in Supabase to verify it exists
            const supabase = createClient(request);
            
            try {
              console.log(`[Middleware] Looking up directory slug in Supabase: ${validatedSlug}`);
              
              const { data, error } = await supabase
                .from('directories')
                .select('directory_slug, domain, brand_color_primary')
                .eq('directory_slug', validatedSlug)
                .eq('is_active', true)
                .maybeSingle();
              
              if (error) {
                console.error(`[Middleware] Supabase error for slug ${validatedSlug}:`, error.message);
              } else if (!data) {
                console.warn(`[Middleware] No directory found in database for slug: ${validatedSlug}`);
              }
              
              if (!error && data) {
                // Directory exists in database - rewrite to the correct path
                const newPath = pathname.replace(`/${potentialSlug}`, '') || '/';
                const targetUrl = new URL(`/directory/${validatedSlug}${newPath}`, request.url);
                
                console.log(`[Middleware] Rewriting to: ${targetUrl.pathname}`);
                
                const dirResponse = NextResponse.rewrite(targetUrl);
                response = addSecurityHeaders(dirResponse);
                response = applyCorsPolicies(request, dirResponse);
                
                // Set directory headers
                response.headers.set('x-directory-slug', validatedSlug);
                if (data.domain) {
                  response.headers.set('x-directory-domain', data.domain);
                }
                if (data.brand_color_primary) {
                  response.headers.set('x-directory-color', data.brand_color_primary);
                }
                
                return response;
              }
            } catch (dbError) {
              console.error(`[Middleware] Database error for slug ${validatedSlug}:`, 
                dbError instanceof Error ? dbError.message : 'Unknown error');
            }
          }
        }
      }
      
      // No valid directory in path - return normal response
      return response;
    }
    
    // Default domain - serve the normal Next.js app
    if (hostname === 'nowdirectories.com' || hostname.endsWith('.vercel.app')) {
      console.log(`[Middleware] Default platform domain: ${hostname}, serving normal app`);
      return response;
    }
    
    // Special case for notaryfindernow.com - directly rewrite to the correct directory
    if (hostname === 'notaryfindernow.com' || hostname === 'www.notaryfindernow.com') {
      console.log(`[Middleware] Handling notaryfindernow.com domain`);
      
      // Validate before using
      const specialSlug = 'notaryfindernow';
      const validatedSpecialSlug = validateInput(specialSlug, 'slug');
      
      if (validatedSpecialSlug) {
        // Direct rewrite to the notaryfindernow directory
        const dirResponse = NextResponse.rewrite(
          new URL(`/directory/${validatedSpecialSlug}${pathname}`, request.url)
        );
        
        // Set directory headers
        dirResponse.headers.set('x-directory-slug', validatedSpecialSlug);
        dirResponse.headers.set('x-directory-domain', hostname);
        
        console.log(`[Middleware] Direct rewrite for notaryfindernow.com to: /directory/notaryfindernow${pathname}`);
        
        // Apply security headers
        response = addSecurityHeaders(dirResponse);
        response = applyCorsPolicies(request, response);
        
        return response;
      }
    }
    
    // Validate hostname before processing
    const validatedHostname = validateInput(hostname, 'domain');
    if (!validatedHostname) {
      console.warn('[Middleware] Invalid hostname detected:', hostname);
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
      console.log(`[Middleware] Using cached directory data for: ${validatedHostname}`);
    } else {
      // Cache miss - look up directory in Supabase
      const supabase = createClient(request);
      
      try {
        console.log(`[Middleware] Fetching directory data for domain: ${validatedHostname}`);
        
        const { data, error } = await supabase
          .from('directories')
          .select('directory_slug, domain, brand_color_primary')
          .eq('domain', validatedHostname)
          .eq('is_active', true)
          .maybeSingle();
        
        if (error) {
          // Log sanitized error without exposing sensitive details
          console.error(`[Middleware] Error fetching directory data for ${validatedHostname}:`, error.message);
          return NextResponse.rewrite(new URL('/error', request.url));
        }
        
        directoryInfo = data as DirectoryInfo | null;
        
        if (!directoryInfo) {
          console.warn(`[Middleware] No directory found for domain: ${validatedHostname}`);
        } else {
          console.log(`[Middleware] Found directory slug: ${directoryInfo.directory_slug} for domain: ${validatedHostname}`);
          // Update domainMap to keep it in sync
          domainMap.set(validatedHostname, directoryInfo.directory_slug);
        }
        
        // Update cache
        DIRECTORY_CACHE.set(cacheKey, {
          data: directoryInfo,
          timestamp: now
        });
      } catch (dbError) {
        console.error('[Middleware] Database query error:', dbError instanceof Error ? dbError.message : 'Unknown error');
        return NextResponse.rewrite(new URL('/error', request.url));
      }
    }
    
    // If directory found, rewrite to the directory page
    if (directoryInfo) {
      // Validate directory slug before using it
      const validatedSlug = validateInput(directoryInfo.directory_slug, 'slug');
      if (!validatedSlug) {
        console.error('[Middleware] Invalid directory slug in database:', directoryInfo.directory_slug);
        return NextResponse.rewrite(new URL('/error', request.url));
      }
      
      // Add directory headers to the response
      const dirResponse = NextResponse.rewrite(
        new URL(`/directory/${validatedSlug}${pathname}`, request.url)
      );
      
      console.log(`[Middleware] Rewriting ${hostname}${pathname} to: /directory/${validatedSlug}${pathname}`);
      
      // Apply security headers
      response = addSecurityHeaders(dirResponse);
      response = applyCorsPolicies(request, response);
      
      // Set response headers for directory info
      response.headers.set('x-directory-slug', validatedSlug);
      response.headers.set('x-directory-domain', directoryInfo.domain);
      response.headers.set('x-directory-color', directoryInfo.brand_color_primary);
      
      return response;
    }
    
    // Directory not found - try to use the default directory slug from environment
    const defaultSlug = environmentService.getValues().defaults.directorySlug;
    if (defaultSlug) {
      console.log(`[Middleware] Using default directory slug: ${defaultSlug}`);
      const defaultResponse = NextResponse.rewrite(
        new URL(`/directory/${defaultSlug}${pathname}`, request.url)
      );
      response = addSecurityHeaders(defaultResponse);
      response.headers.set('x-directory-slug', defaultSlug);
      return response;
    }
    
    // No default directory - show 404 page
    console.warn(`[Middleware] No directory mapping found for: ${hostname}, showing 404`);
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
