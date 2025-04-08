'use client'

/**
 * Client-side environment variables
 * This module should only be imported in client components
 * All variables must be NEXT_PUBLIC_ prefixed
 */

export const clientEnv = {
  // Supabase client-side variables
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Other client-side environment variables
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
}
