'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

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
        // Get the environment variables from Next.js
        // Next.js injects these values at build time into the client JS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        // Verify that we have the required values
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables');
          return;
        }

        // Create the real client with the actual environment variables
        const realClient = createSupabaseClient(
          supabaseUrl,
          supabaseAnonKey,
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
  // Initialize with environment variables or fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackKey;

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
