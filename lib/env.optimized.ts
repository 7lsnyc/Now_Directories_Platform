/**
 * Optimized Environment Variable Management
 * 
 * A more efficient approach with:
 * - Pre-computed values to avoid runtime overhead
 * - Smaller bundle size impact
 * - Still maintains type safety and error handling
 */

import { ConfigError } from './errors/ConfigError';

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
  NODE_ENV: getNonCriticalVar('NODE_ENV', 'development' as const),
  DEFAULT_DIRECTORY_SLUG: getNonCriticalVar('DEFAULT_DIRECTORY_SLUG', 'notary'),
  
  // Optional configs
  ENABLE_ANALYTICS: getNonCriticalVar('ENABLE_ANALYTICS', ENV.isProd, toBoolean),
  DEBUG_MODE: getNonCriticalVar('DEBUG_MODE', ENV.isDev, toBoolean),
  API_TIMEOUT_MS: getNonCriticalVar('API_TIMEOUT_MS', 10000, toNumber),
  
  // External API keys (optional)
  GOOGLE_MAPS_API_KEY: getNonCriticalVar('GOOGLE_MAPS_API_KEY', undefined),
  STRIPE_PUBLIC_KEY: getNonCriticalVar('STRIPE_PUBLIC_KEY', undefined),
  STRIPE_SECRET_KEY: getNonCriticalVar('STRIPE_SECRET_KEY', undefined),
  
  // Helper methods
  isProd: ENV.isProd,
  isDev: ENV.isDev
};

export default env;
