'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { RuntimeConfig } from '@/app/env-config';

/**
 * This context and provider ensures that client-side components
 * have access to Supabase without synchronous access to environment
 * variables during hydration.
 */

// Default values that avoid errors during initial render
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

// Create context to provide the Supabase client throughout the app
interface SupabaseContextType {
  supabase: SupabaseClient | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isLoading: true,
});

/**
 * A provider component that safely initializes the Supabase client on the client side
 * and provides it via context to child components.
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create an initial Supabase client with fallback values
    // This prevents errors during initial render
    const initialClient = createSupabaseClient(
      fallbackUrl,
      fallbackKey,
      { auth: { autoRefreshToken: true, persistSession: true } }
    );
    setSupabase(initialClient);

    // Function to create a real client once we have the environment variables
    const initializeRealClient = async () => {
      try {
        // Use the runtime config values guaranteed to be available at runtime
        const supabaseUrl = RuntimeConfig.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = RuntimeConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Check for client-side window.__RUNTIME_CONFIG which may contain updated values
        const windowConfig = typeof window !== 'undefined' ? (window as any).__RUNTIME_CONFIG : null;
        
        // Use window config values if available (these are guaranteed to be embedded in the client JS)
        const finalUrl = windowConfig?.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl || '';
        const finalKey = windowConfig?.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey || '';

        // Verify that we have the required values
        if (!finalUrl || !finalKey) {
          console.error('Missing Supabase environment variables');
          return;
        }

        // Create the real client with the actual environment variables
        const realClient = createSupabaseClient(
          finalUrl,
          finalKey,
          { auth: { autoRefreshToken: true, persistSession: true } }
        );

        // Replace the initial client with the real one
        setSupabase(realClient);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Call the initialization function
    initializeRealClient();

    // No cleanup needed
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook to use the Supabase client from any client component
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

/**
 * Create a client-side Supabase client
 * This is a simpler alternative to the provider pattern if you just need
 * a client instance without sharing state
 */
export function createClient() {
  // Check for the global runtime config which is guaranteed to be available
  const windowConfig = typeof window !== 'undefined' ? (window as any).__RUNTIME_CONFIG : null;
  
  // Use window config first (guaranteed embedded), then RuntimeConfig, then fallbacks
  const supabaseUrl = windowConfig?.NEXT_PUBLIC_SUPABASE_URL || 
                     RuntimeConfig.NEXT_PUBLIC_SUPABASE_URL || 
                     fallbackUrl;
  
  const supabaseAnonKey = windowConfig?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                         RuntimeConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                         fallbackKey;

  return createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      }
    }
  );
}
