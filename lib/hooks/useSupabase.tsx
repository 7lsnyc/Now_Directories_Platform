/**
 * Supabase Client Hook
 * 
 * This hook provides a Supabase client that's only initialized once
 * environment variables are properly loaded. It solves the race condition
 * where Supabase was being initialized before environment variables were
 * available in the client.
 */

import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { fetchClientEnv } from '@/lib/env';

// Create a global reference to prevent multiple clients
let globalSupabaseClient: SupabaseClient<Database> | null = null;

/**
 * React hook that provides a Supabase client instance
 * The client is only created after environment variables are confirmed available
 * 
 * @returns {Object} Object containing the Supabase client and loading state
 */
export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(globalSupabaseClient);
  const [loading, setLoading] = useState(!globalSupabaseClient);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip initialization if we already have a client
    if (globalSupabaseClient) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    async function initializeSupabase() {
      try {
        // Fetch environment variables from the API
        const env = await fetchClientEnv();
        
        // Verify required variables exist
        if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Missing required Supabase environment variables');
        }

        // Create the Supabase client with the fetched variables
        const client = createClient<Database>(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            auth: {
              persistSession: true,
              detectSessionInUrl: true
            }
          }
        );

        // Only update state if component is still mounted
        if (isMounted) {
          globalSupabaseClient = client;
          setSupabase(client);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    initializeSupabase();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  return { supabase, loading, error };
}

export default useSupabase;
