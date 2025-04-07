/**
 * Security middleware to apply best practices
 * Adds security headers, CORS settings, and helps prevent common vulnerabilities
 */
import { NextRequest, NextResponse } from 'next/server';

/**
 * Adds security headers to the response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy to prevent XSS
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' *.supabase.co *.openstreetmap.org ipapi.co"
  );
  
  // HSTS to enforce HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  
  // Prevent clickjacking - using SAMEORIGIN instead of DENY to allow embedding in preview
  // In production, this should be set back to DENY for maximum security
  const isDev = process.env.NODE_ENV === 'development';
  response.headers.set('X-Frame-Options', isDev ? 'SAMEORIGIN' : 'DENY');
  
  // Disable MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  return response;
}

/**
 * Validates input to prevent SQL injection and other attacks
 * @param value Input string to validate
 * @param type Type of validation to perform
 * @returns Sanitized string or null if invalid
 */
export function validateInput(value: string, type: 'domain' | 'slug' | 'generic' = 'generic'): string | null {
  if (!value) return null;
  
  // Remove any potentially dangerous characters
  let sanitized: string | null = value.trim();
  
  switch (type) {
    case 'domain':
      // Domain should only contain valid domain characters
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(sanitized)) {
        return null;
      }
      break;
    
    case 'slug':
      // Slug should only contain alphanumeric characters, hyphens, and underscores
      if (!/^[a-zA-Z0-9-_]+$/.test(sanitized)) {
        return null;
      }
      break;
      
    case 'generic':
    default:
      // Generic inputs should not contain script tags or SQL injection patterns
      if (/(<script|javascript:|alert\(|SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR\s+['\d]+=\s*['\d]+|'.*--)/i.test(sanitized)) {
        return null;
      }
      break;
  }
  
  return sanitized;
}

/**
 * Apply CORS headers for the Now Directories platform
 * Restricts access to specific origins
 */
export function applyCorsPolicies(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  
  // Allow list of approved domains
  const allowedOrigins = [
    'https://nowdirectories.com',
    'https://notaryfindernow.com',
    'https://passportservicesnow.com',
    'https://www.nowdirectories.com',
    'https://www.notaryfindernow.com',
    'https://www.passportservicesnow.com'
  ];
  
  // Allow localhost and *.vercel.app in development
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
    // Add vercel preview domains
    if (origin?.includes('.vercel.app')) {
      allowedOrigins.push(origin);
    }
  }
  
  // Set CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}
