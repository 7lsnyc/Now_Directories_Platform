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
  
  // --- TEMPORARY DEBUG LOGGING ---
  console.log('[DEBUG server.ts] Attempting to create Supabase client.');
  console.log(`[DEBUG server.ts] Using URL: "${url}"`); // Log the URL
  // IMPORTANT: Be careful logging the service key, maybe just log its presence/length
  console.log(`[DEBUG server.ts] Service Key Provided: ${!!serviceRoleKey}`);
  console.log(`[DEBUG server.ts] Service Key Length: ${serviceRoleKey?.length || 0}`);
  // --- END DEBUG LOGGING ---
  
  // Validate environment variables
  if (!url || !serviceRoleKey) {
    console.error('[DEBUG server.ts] Validation FAILED: Missing URL or Service Key!');
    throw new Error(
      `Missing Supabase server environment variables. ` +
      `Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.`
    );
  }
  
  console.log('[DEBUG server.ts] Validation Passed. Calling createSupabaseClient...');
  
  // Create server client with service role key
  try {
    const client = createSupabaseClient(url, serviceRoleKey, { // Assign to temp var
      auth: {
        persistSession: false,  // No session persistence on server
        autoRefreshToken: false,
      },
    });
    console.log('[DEBUG server.ts] createSupabaseClient call DID NOT THROW.'); // Log success attempt
    console.log(`[DEBUG server.ts] Client object type: ${typeof client}`); // What type is it?
    console.log(`[DEBUG server.ts] Client has .from method?: ${typeof client?.from === 'function'}`); // Check for .from
    return client; // Return it
  } catch (creationError) {
    console.error('[DEBUG server.ts] ERROR during createSupabaseClient call:', creationError);
    throw creationError; // Re-throw after logging
  }
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
