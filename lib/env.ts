/**
 * Optimized Environment Variable Management
 * 
 * A more efficient approach with:
 * - Pre-computed values to avoid runtime overhead
 * - Smaller bundle size impact
 * - Still maintains type safety and error handling
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
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
};

// Validators (only used during initialization)
const isValidUrl = (url: string): boolean => {
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
  const value = process.env[key];
  
  if (!value) {
    if (ENV.isProd) {
      throw new ConfigError(`Missing critical environment variable: ${key}`);
    }
    console.warn(`⚠️ Missing critical environment variable: ${key}. Using fallback for development only.`);
    return `dev-placeholder-${key.toLowerCase()}`;
  }
  
  if (validator && !validator(value)) {
    if (ENV.isProd) {
      throw new ConfigError(`Invalid value for environment variable: ${key}`);
    }
    console.warn(`⚠️ Invalid value for environment variable: ${key}. Using fallback for development only.`);
    return `dev-placeholder-${key.toLowerCase()}`;
  }
  
  return value;
};

// Pre-compute non-critical values with defaults
const getNonCriticalVar = <T>(key: string, defaultValue: T, transformer?: (val: string) => T): T => {
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

// Singleton export with pre-computed values
// This reduces runtime overhead as values are calculated only once at import time
export const env = {
  // Critical variables (with validation)
  NEXT_PUBLIC_SUPABASE_URL: getCriticalVar('NEXT_PUBLIC_SUPABASE_URL', isValidUrl),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getCriticalVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getCriticalVar('SUPABASE_SERVICE_ROLE_KEY'),
  
  // Application config with defaults
  NODE_ENV: getNonCriticalVar<'development' | 'production' | 'test'>('NODE_ENV', 'development'),
  DEFAULT_DIRECTORY_SLUG: getNonCriticalVar('DEFAULT_DIRECTORY_SLUG', 'notary'),
  
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
