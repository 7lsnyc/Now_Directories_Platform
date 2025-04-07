import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { environmentService } from '../services/EnvironmentService';

/**
 * Creates a Supabase client with guaranteed environment variables
 * Will throw an error if the environment is not properly configured
 * For client-side usage
 */
export function createClient() {
  // Ensure environment is initialized
  environmentService.initialize();
  const env = environmentService.getValues();
  
  // Create and return the client
  return createSupabaseClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
}

/**
 * Creates a Supabase service client using the service role key
 * Only for server-side usage in trusted contexts
 */
export function createServiceClient() {
  // Ensure environment is initialized
  environmentService.initialize();
  const env = environmentService.getValues();
  
  // Create and return the service client
  return createSupabaseClient(
    env.supabase.url,
    env.supabase.serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
