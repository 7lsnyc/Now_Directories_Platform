/**
 * Utility for safely getting a Supabase client in any context (React or non-React)
 * This provides a consistent approach to creating Supabase clients across the application
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { fetchClientEnv } from '@/lib/env';

// Cache for the Supabase client
let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Gets or creates a Supabase client safely
 * For server-side or non-React client contexts
 * 
 * @param options Configuration options
 * @returns Promise resolving to a Supabase client or null if not available
 */
export async function getSupabaseClient(options: {
  forceNew?: boolean;  // Force creation of a new client, ignoring cache
} = {}): Promise<SupabaseClient<Database> | null> {
  // Return cached client if available and not forcing new
  if (cachedClient && !options.forceNew) {
    return cachedClient;
  }

  try {
    // For client-side (browser), fetch environment variables from API
    if (typeof window !== 'undefined') {
      const env = await fetchClientEnv();
      
      if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing required Supabase environment variables');
        return null;
      }
      
      // Create and cache the client
      cachedClient = createClient<Database>(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            detectSessionInUrl: true
          }
        }
      );
      
      return cachedClient;
    } 
    // For server-side, use process.env directly
    else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing required Supabase environment variables');
        return null;
      }
      
      // Create and cache the client
      cachedClient = createClient<Database>(
        supabaseUrl,
        supabaseKey,
        {
          auth: {
            persistSession: true,
            detectSessionInUrl: true
          }
        }
      );
      
      return cachedClient;
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

export default getSupabaseClient;
