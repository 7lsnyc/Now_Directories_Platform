/**
 * Build-safe environment configuration for Vercel
 * 
 * This file provides safe fallbacks during the build process while
 * maintaining type safety and preserving the actual runtime behavior
 */

// This is a separate module that Next.js can tree-shake and optimize
export const isBuildTime = typeof process !== 'undefined' && 
  process.env.VERCEL_ENV === 'production' && 
  (typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'undefined' ||
   typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'undefined');

// Safe placeholder structure for the environment service during build
export const buildSafeEnvironment = {
  // Supabase configuration (used only during build)
  NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder-during-build.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key-for-build-only',
  SUPABASE_SERVICE_ROLE_KEY: 'placeholder-service-key-for-build-only',
  
  // Application defaults (these should match production values for consistency)
  DEFAULT_DIRECTORY_SLUG: 'notaryfindernow',
  
  // Helper methods that mimic the real environment service
  initialize: () => {},
  getValues: () => ({
    supabase: {
      url: 'https://placeholder-during-build.supabase.co',
      anonKey: 'placeholder-during-build',
      serviceRoleKey: 'placeholder-during-build',
    },
    defaults: {
      directorySlug: 'notaryfindernow'
    },
    analytics: {
      enabled: false,
      googleAnalyticsId: ''
    },
    debug: false
  }),
  hasErrors: () => false,
  getErrors: () => [],
  refresh: () => {},
};
