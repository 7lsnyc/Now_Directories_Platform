/**
 * Server-side environment variables
 * This module should only be imported in server components or server-side code
 */

export const serverEnv = {
  // Supabase server-side variables
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Other server-only environment variables
  defaultDirectorySlug: process.env.DEFAULT_DIRECTORY_SLUG || 'notaryfindernow',
  enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  debugMode: process.env.DEBUG_MODE === 'true',
}

/**
 * Validates that all required server environment variables are present
 * Use this in server components/API routes that depend on these variables
 */
export function validateServerEnv() {
  const missingVars = [];
  
  if (!serverEnv.supabase.url) missingVars.push('SUPABASE_URL');
  if (!serverEnv.supabase.serviceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}
