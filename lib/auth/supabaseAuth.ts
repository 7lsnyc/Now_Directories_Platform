import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { domainMap } from '@/middleware';
import { serverEnv } from '@/lib/env/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Gets the Supabase client for server components
 * This includes the directory_slug claim in the JWT based on the current host
 */
export const getSupabaseServerClient = async () => {
  // Validate required environment variables
  if (!serverEnv.supabase.url || !serverEnv.supabase.serviceRoleKey) {
    throw new Error('Missing required Supabase environment variables');
  }
  
  // Get cookie store
  const cookieStore = cookies();
  
  // Get host from the request headers (or a hidden cookie set by middleware)
  // We can alternatively use a cookie set by our middleware if the headers approach doesn't work
  const host = cookieStore.get('x-host')?.value || '';
  
  // Determine directory slug from host
  const directorySlug = domainMap.get(host) || serverEnv.defaultDirectorySlug;
  
  // Create Supabase client with custom fetch handler that adds JWT claims
  // This approach adds the directory_slug to the token used for all Supabase requests
  return createClient(
    serverEnv.supabase.url,
    serverEnv.supabase.serviceRoleKey,
    {
      auth: {
        persistSession: false,
        // Add directory_slug to the JWT claims
        // This is used by RLS policies to filter data by directory
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        // Custom fetch handler to add directory_slug to the request
        // Supabase will use this to set JWT claims in server functions or edge functions
        fetch: async (url, options = {}) => {
          // Get the existing headers
          const headers = new Headers(options.headers);
          
          // Add the directory slug header
          // Supabase will use this to set JWT claims in server functions or edge functions
          headers.set('x-directory-slug', directorySlug);
          
          // Update the options with the new headers
          options.headers = headers;
          
          // Make the request
          return fetch(url, options);
        },
      },
    }
  );
};

/**
 * Server action to sign in a user and set directory_slug in the JWT claims
 */
export async function signInWithEmailAndPassword(email: string, password: string, host?: string) {
  try {
    // Create Supabase client with JWT custom claims
    const supabase = await getSupabaseServerClient();
    
    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
}

/**
 * Server action to handle sign up with directory_slug in JWT
 */
export async function signUpWithEmailAndPassword(email: string, password: string, metadata?: Record<string, any>) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get the directory_slug from metadata or other source
    const directorySlug = metadata?.directorySlug || 'platform';
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Add directory_slug to user metadata
        // This will be available in the JWT claims
        data: {
          ...metadata,
          directory_slug: directorySlug,
        },
      },
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
}
