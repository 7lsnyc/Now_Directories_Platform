// IMPORTANT: This file ensures environment variables are available during initial client render
// It is imported and executed very early in the client bundle process

// DO NOT hardcode any actual values here - these are populated during build time from Vercel environment variables
export const RuntimeConfig = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

// This trick ensures these values get embedded in the client JS during build
if (typeof window !== 'undefined') {
  // Only mark this on client-side
  window.__RUNTIME_CONFIG = RuntimeConfig;
}
