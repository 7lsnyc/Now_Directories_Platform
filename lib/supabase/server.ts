import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';
import { environmentService } from '@/lib/services/EnvironmentService';

/**
 * Creates a Supabase client for server components and pages
 * Properly initializes environment variables and uses server-side keys
 */
export function createClient() {
  const cookieStore = cookies();
  
  // Initialize environment service to ensure variables are loaded
  environmentService.initialize();
  const env = environmentService.getValues();
  
  // Get URL from server-side variables (could be the same as client URL)
  const supabaseUrl = env.supabase.url;
  
  // Use service role key for server operations (more privileged than anon key)
  const supabaseKey = env.supabase.serviceRoleKey;
  
  // Validate critical environment variables before creating the client
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable for server Supabase client');
  }
  
  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable for server Supabase client');
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
