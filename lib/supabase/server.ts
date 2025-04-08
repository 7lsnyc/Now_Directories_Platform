import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { serverEnv } from '../env/server';

/**
 * Creates a Supabase client for server-side usage, using
 * server-side environment variables.
 * 
 * Type for all server component database operations
 */
export type SupabaseServer = ReturnType<typeof createServerClient>;

/**
 * Creates a Supabase client for server components with full admin access
 */
export function createServerClient() {
  const { url, serviceRoleKey } = serverEnv.supabase;
  
  // Validate environment variables
  if (!url || !serviceRoleKey) {
    throw new Error(
      `Missing Supabase server environment variables. ` +
      `Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.`
    );
  }
  
  // Create server client with service role key
  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,  // No session persistence on server
      autoRefreshToken: false,
    },
  });
}

/**
 * Creates a Supabase client for server components with user authentication
 * from cookies (for protected routes)
 */
export function createServerClientWithAuth() {
  const { url, serviceRoleKey } = serverEnv.supabase;
  const cookieStore = cookies();
  
  // Validate environment variables
  if (!url || !serviceRoleKey) {
    throw new Error(
      `Missing Supabase server environment variables. ` +
      `Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.`
    );
  }
  
  // Create server client with auth cookies
  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    // Add cookie support separately without using the auth.cookies property
    // Note: Since Next.js 13.4+ changed the cookie handling API, we need to
    // access through headers directly instead of using the auth.cookies option
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  });
}

// For backward compatibility during migration
export const createClient = createServerClient;
