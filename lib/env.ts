/**
 * Optimized Environment Variable Management
 * 
 * A more efficient approach with:
 * - Pre-computed values to avoid runtime overhead
 * - Smaller bundle size impact
 * - Still maintains type safety and error handling
 * - Build-safe for Vercel deployments
 */

import { ConfigError } from './errors/ConfigError';

/**
 * Environment variable configuration types
 */
export interface EnvironmentVariables {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Application configuration
  NODE_ENV: 'development' | 'production' | 'test';
  DEFAULT_DIRECTORY_SLUG: string;
  
  // Optional configurations
  ENABLE_ANALYTICS?: boolean;
  DEBUG_MODE?: boolean;
  API_TIMEOUT_MS?: number;
  
  // External API keys (may be added as the platform grows)
  GOOGLE_MAPS_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLIC_KEY?: string;
}

// Environment detection (computed once at import time)
const ENV = {
  isProd: typeof process !== 'undefined' && process.env.NODE_ENV === 'production',
  isDev: typeof process !== 'undefined' && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'),
};

// CRITICAL: More robust build detection that will be properly evaluated during Next.js static analysis
// This uses multiple signals to detect a build environment
const isVercelBuild = typeof process !== 'undefined' && (
  // Only check build signals, not runtime environment
  // We should no longer check for missing variables in production as that could be true at runtime
  (process.env.npm_lifecycle_event === 'build') ||
  // Fallback: NEXT_PHASE is defined by Next.js during certain build operations
  (typeof process.env.NEXT_PHASE !== 'undefined' && 
   ['phase-production-build', 'phase-export'].includes(process.env.NEXT_PHASE || ''))
);

// Client-side next/config access (won't throw errors unlike direct process.env access)
const getClientEnv = () => {
  // For client-side, try to get from next.config public runtime config
  if (typeof window !== 'undefined') {
    try {
      // Access from window.__NEXT_DATA__.runtimeConfig if available
      // This is more reliable than direct process.env access at runtime
      // @ts-ignore - next.js adds this but TypeScript doesn't know about it
      if (window.__NEXT_DATA__?.runtimeConfig) {
        // @ts-ignore
        return window.__NEXT_DATA__.runtimeConfig;
      }
    } catch (e) {
      console.warn('Failed to access client-side runtime config', e);
    }
  }
  
  // Direct access fallback (process.env for server, empty for client if not in Next.js data)
  return typeof process !== 'undefined' ? process.env : {};
};

// Validators (only used during initialization)
const isValidUrl = (url: string): boolean => {
  if (isVercelBuild) return true; // Skip validation during build
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate and prepare critical environment variables
// This runs once at import time rather than on each access
const getCriticalVar = (key: string, validator?: (val: string) => boolean): string => {
  // CRITICAL: This check MUST be the very first thing we do
  // It prevents any validation code from running during build
  if (isVercelBuild) {
    return `build-placeholder-${key.toLowerCase()}`;
  }

  // Enhanced environment variable access strategy that works in all contexts
  const clientEnv = getClientEnv();
  const value = clientEnv[key] || process.env[key];
  
  if (!value) {
    if (ENV.isProd && !isVercelBuild) {
      throw new ConfigError(`Missing critical environment variable: ${key}`);
    }
    console.warn(`⚠️ Missing critical environment variable: ${key}. Using fallback for development only.`);
    return `dev-placeholder-${key.toLowerCase()}`;
  }
  
  if (validator && !validator(value)) {
    if (ENV.isProd && !isVercelBuild) {
      throw new ConfigError(`Invalid value for environment variable: ${key}`);
    }
    console.warn(`⚠️ Invalid value for environment variable: ${key}. Using fallback for development only.`);
    return `dev-placeholder-${key.toLowerCase()}`;
  }
  
  return value;
};

// Pre-compute non-critical values with defaults
const getNonCriticalVar = <T>(key: string, defaultValue: T, transformer?: (val: string) => T): T => {
  if (isVercelBuild) return defaultValue; // Skip during build
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return transformer ? transformer(value) : value as unknown as T;
};

// Transform helpers
const toBoolean = (value: string): boolean => value === 'true' || value === '1';
const toNumber = (value: string): number => {
  const num = parseInt(value, 10);
  return isNaN(num) ? 0 : num;
};

// Create a build-safe version of our environment
// The entire module export is organized to ensure it won't throw during builds
export const env = isVercelBuild 
  ? {
      // Build-time placeholders that won't throw errors
      NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder-for-build.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-for-build-key',
      SUPABASE_SERVICE_ROLE_KEY: 'placeholder-for-build-service-key',
      
      // Safe defaults for application config
      NODE_ENV: 'production' as const,
      DEFAULT_DIRECTORY_SLUG: 'notaryfindernow',
      
      // Safe defaults for optional configs
      ENABLE_ANALYTICS: false,
      DEBUG_MODE: false,
      API_TIMEOUT_MS: 10000,
      
      // Safe defaults for external APIs
      GOOGLE_MAPS_API_KEY: undefined,
      STRIPE_PUBLIC_KEY: undefined,
      STRIPE_SECRET_KEY: undefined,
      
      // Environment helpers
      isProd: true,
      isDev: false,
      isVercelBuild: true,
      
      // Stub methods that won't throw during build
      checkCriticalVars: () => ({ isValid: true, errors: [] }),
      getAllVars: () => ({})
    }
  : {
      // Critical variables (with validation)
      NEXT_PUBLIC_SUPABASE_URL: getCriticalVar('NEXT_PUBLIC_SUPABASE_URL', isValidUrl),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: getCriticalVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: getCriticalVar('SUPABASE_SERVICE_ROLE_KEY'),
      
      // Application config with defaults
      NODE_ENV: getNonCriticalVar<'development' | 'production' | 'test'>('NODE_ENV', 'development'),
      DEFAULT_DIRECTORY_SLUG: getNonCriticalVar('DEFAULT_DIRECTORY_SLUG', 'notaryfindernow'),
      
      // Optional configs
      ENABLE_ANALYTICS: getNonCriticalVar('ENABLE_ANALYTICS', ENV.isProd, toBoolean),
      DEBUG_MODE: getNonCriticalVar('DEBUG_MODE', ENV.isDev, toBoolean),
      API_TIMEOUT_MS: getNonCriticalVar('API_TIMEOUT_MS', 10000, toNumber),
      
      // External API keys (optional)
      GOOGLE_MAPS_API_KEY: getNonCriticalVar<string | undefined>('GOOGLE_MAPS_API_KEY', undefined),
      STRIPE_PUBLIC_KEY: getNonCriticalVar<string | undefined>('STRIPE_PUBLIC_KEY', undefined),
      STRIPE_SECRET_KEY: getNonCriticalVar<string | undefined>('STRIPE_SECRET_KEY', undefined),
      
      // Environment helpers
      isProd: ENV.isProd,
      isDev: ENV.isDev,
      isVercelBuild,
      
      /**
       * Helper method to check if all critical variables are set correctly
       * Use this to determine if the application can function properly
       */
      checkCriticalVars(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Check Supabase URL
        if (!this.NEXT_PUBLIC_SUPABASE_URL || !isValidUrl(this.NEXT_PUBLIC_SUPABASE_URL)) {
          errors.push('Invalid or missing NEXT_PUBLIC_SUPABASE_URL');
        }
        
        // Check Supabase anon key
        if (!this.NEXT_PUBLIC_SUPABASE_ANON_KEY || this.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 10) {
          errors.push('Invalid or missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
        }
        
        // Check Supabase service role key
        if (!this.SUPABASE_SERVICE_ROLE_KEY || this.SUPABASE_SERVICE_ROLE_KEY.length < 10) {
          errors.push('Invalid or missing SUPABASE_SERVICE_ROLE_KEY');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      },
      
      /**
       * Get all environment variables for debugging (development only)
       * This is helpful for troubleshooting environment issues
       */
      getAllVars(): Partial<EnvironmentVariables> {
        if (!ENV.isDev) {
          console.warn('getAllVars() should only be used in development mode');
          return {};
        }
        
        return {
          NEXT_PUBLIC_SUPABASE_URL: this.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: this.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : undefined,
          SUPABASE_SERVICE_ROLE_KEY: this.SUPABASE_SERVICE_ROLE_KEY ? '***' : undefined,
          NODE_ENV: this.NODE_ENV,
          DEFAULT_DIRECTORY_SLUG: this.DEFAULT_DIRECTORY_SLUG,
          ENABLE_ANALYTICS: this.ENABLE_ANALYTICS,
          DEBUG_MODE: this.DEBUG_MODE,
          API_TIMEOUT_MS: this.API_TIMEOUT_MS,
          GOOGLE_MAPS_API_KEY: this.GOOGLE_MAPS_API_KEY ? '***' : undefined,
          STRIPE_PUBLIC_KEY: this.STRIPE_PUBLIC_KEY ? '***' : undefined,
          STRIPE_SECRET_KEY: this.STRIPE_SECRET_KEY ? '***' : undefined,
        };
      }
    };

export default env;
