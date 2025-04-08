import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side usage, using
 * server-side environment variables. These are loaded from 
 * the Vercel project settings, not from client-side.
 */
export function createClient() {
  // In server components, we should use server-side environment variables directly
  // This ensures they're loaded at build time and don't require client-side fetch
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Validate critical environment variables
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable in server.ts');
  }
  
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable in server.ts');
  }
  
  // Create the Supabase client with the server-side environment variables
  return createSupabaseClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
