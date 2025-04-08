/**
 * Supabase Provider Component
 * 
 * A wrapper component that initializes the Supabase client and provides it to children
 * only after environment variables are properly loaded. This solves the race condition
 * where components were trying to use Supabase before environment variables were available.
 */

import React from 'react';
import { useSupabase } from '@/lib/hooks/useSupabase';

type SupabaseProviderProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback UI while loading
  errorComponent?: React.ReactNode; // Optional error UI
};

/**
 * SupabaseProvider ensures Supabase is fully initialized before rendering children
 * Use this component to wrap any components that need Supabase access
 */
export function SupabaseProvider({ 
  children, 
  fallback = <div className="p-4 text-center">Loading application...</div>,
  errorComponent = null
}: SupabaseProviderProps) {
  const { supabase, loading, error } = useSupabase();

  // Show loading state while Supabase initializes
  if (loading) {
    return <>{fallback}</>;
  }

  // Show error state if initialization failed
  if (error) {
    console.error('Supabase initialization error:', error);
    return errorComponent ? (
      <>{errorComponent}</>
    ) : (
      <div className="p-4 text-center text-red-600">
        <p>There was an error initializing the application.</p>
        <p className="text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  // Render children with Supabase available
  return <>{children}</>;
}

export default SupabaseProvider;
