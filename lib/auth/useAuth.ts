'use client';

import { useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { handleAuthError, ErrorResponse } from '@/lib/errors/errorHandling';

/**
 * Custom hook for authentication with integrated error handling
 * Provides login, signup, and logout functionality with standardized error responses
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        const errorResponse = handleAuthError(supabaseError);
        setError(errorResponse);
        return { success: false, error: errorResponse };
      }

      return { success: true };
    } catch (err) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse);
      return { success: false, error: errorResponse };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (supabaseError) {
        const errorResponse = handleAuthError(supabaseError);
        setError(errorResponse);
        return { success: false, error: errorResponse };
      }

      return { success: true };
    } catch (err) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse);
      return { success: false, error: errorResponse };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.auth.signOut();

      if (supabaseError) {
        const errorResponse = handleAuthError(supabaseError);
        setError(errorResponse);
        return { success: false, error: errorResponse };
      }

      return { success: true };
    } catch (err) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse);
      return { success: false, error: errorResponse };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    loading,
    error,
    clearError,
  };
}
