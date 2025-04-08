'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { clientEnv } from '../env/client';

// Create context for the Supabase client
interface SupabaseContextType {
  supabase: SupabaseClient | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isLoading: true,
});

/**
 * Provider component that initializes Supabase on the client
 * This handles hydration properly by avoiding synchronous env var access
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This runs only on the client, after hydration
    function initializeSupabase() {
      try {
        // Get environment values from client-side environment
        const { url, anonKey } = clientEnv.supabase;
        
        // Ensure we have the required variables
        if (!url || !anonKey) {
          console.error(
            'Missing Supabase client environment variables. ' +
            'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
          );
          setIsLoading(false);
          return;
        }
        
        // Create the client with the real environment variables
        const client = createSupabaseClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
        
        setSupabase(client);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        setIsLoading(false);
      }
    }
    
    initializeSupabase();
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook for client components to access Supabase
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
}
