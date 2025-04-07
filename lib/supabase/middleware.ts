import { createServerClient } from '@supabase/ssr';
import { type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a Supabase client for middleware
 * Based on the Supabase SSR client documentation
 */
export function createClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Validate critical environment variables
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required environment variables for Supabase client');
  }

  // Create a cookies container
  const cookieStore = {
    get(name: string) {
      const cookies = request.cookies.getAll();
      for (const cookie of cookies) {
        if (cookie.name === name) return cookie.value;
      }
      return '';
    },
    set(name: string, value: string, options: CookieOptions) {
      request.cookies.set({
        name,
        value,
        ...options,
      });
    },
    remove(name: string, options: CookieOptions) {
      request.cookies.set({
        name,
        value: '',
        ...options,
      });
    }
  };

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: cookieStore,
    }
  );
}
