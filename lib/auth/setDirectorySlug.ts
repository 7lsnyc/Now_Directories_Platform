import { createClient } from '@supabase/supabase-js';

// Helper function to set directory_slug in JWT claims during auth
export async function setDirectorySlugInToken(
  supabaseUrl: string,
  supabaseKey: string,
  token: string,
  directorySlug: string
) {
  try {
    // Initialize Supabase client with admin key
    const supabase = createClient(supabaseUrl, supabaseKey);

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
    console.error('Error in setDirectorySlugInToken:', error);
    return null;
  }
}

// Example usage in auth callback
// This would be used in pages/api/auth/callback.ts or similar
/*
import { NextApiRequest, NextApiResponse } from 'next';
import { setDirectorySlugInToken } from '@/lib/auth/setDirectorySlug';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the host and map it to a directory slug
  const host = req.headers.host || '';
  const directorySlug = domainMap[host] || 'platform';
  
  // Get the token from auth provider callback
  const { token } = req.query;
  
  // Set the directory slug in the JWT
  const newToken = await setDirectorySlugInToken(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Needs service role for JWT operations
    token as string,
    directorySlug
  );
  
  // Continue with auth flow...
}
*/
