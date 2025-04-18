// Supabase Edge Function to set directory_slug in JWT claims
// Deploy with: supabase functions deploy set-directory-claim

// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @deno-types="https://esm.sh/@supabase/supabase-js@2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Type for request payload
interface RequestPayload {
  token: string;
  directorySlug: string;
}

// Define types for Deno environment
declare global {
  namespace Deno {
    interface Env {
      get(key: string): string | undefined;
    }
    const env: Env;
  }
}

// Define request type
interface RequestType {
  method: string;
  headers: Headers;
  json: () => Promise<any>;
}

serve(async (req: RequestType) => {
  try {
    // Get request data
    const { token, directorySlug } = await req.json() as RequestPayload
    
    if (!token || !directorySlug) {
      return new Response(
        JSON.stringify({ error: "Missing token or directorySlug" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    
    // Get Supabase admin client from environment variables
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Decode the JWT to get user information
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }
    
    // Update user metadata to include directory_slug
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          directory_slug: directorySlug
        }
      }
    )
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }
    
    // Return success with the updated user
    return new Response(
      JSON.stringify({ 
        message: "Directory slug set successfully",
        user_id: user.id,
        directory_slug: directorySlug
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    )
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
