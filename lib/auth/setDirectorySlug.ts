import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env/server';

/**
 * Helper function to set directory_slug in JWT claims during auth
 * Uses service role key to make Edge Function call
 */
export async function setDirectorySlugInToken(
  token: string,
  directorySlug: string
) {
  try {
    // Validate required environment variables
    if (!serverEnv.supabase.url || !serverEnv.supabase.serviceRoleKey) {
      throw new Error('Missing required Supabase environment variables');
    }
    
    // Initialize Supabase client with admin key
    const supabase = createClient(
      serverEnv.supabase.url, 
      serverEnv.supabase.serviceRoleKey
    );

    // Make an API call to a custom Supabase Edge Function 
    // that would update the JWT with the directory_slug claim
    const { data, error } = await supabase.functions.invoke('set-directory-claim', {
      body: { token, directorySlug },
    });

    if (error) {
      console.error('Error setting directory slug in JWT:', error);
      return null;
    }

    return data.token;
  } catch (error) {
    console.error('Error in setDirectorySlugInToken:', 
      error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Example usage in auth callback
// This would be used in pages/api/auth/callback.ts or similar
/*
import { NextApiRequest, NextApiResponse } from 'next';
import { setDirectorySlugInToken } from '@/lib/auth/setDirectorySlug';
import { serverEnv } from '@/lib/env/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the host and map it to a directory slug
  const host = req.headers.host || '';
  const directorySlug = domainMap[host] || serverEnv.defaultDirectorySlug;
  
  // Get the token from auth provider callback
  const { token } = req.query;
  
  // Set the directory slug in the JWT
  const newToken = await setDirectorySlugInToken(
    token as string,
    directorySlug
  );
  
  // Continue with auth flow...
}
*/
