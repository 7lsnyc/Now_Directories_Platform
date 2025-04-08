/**
 * Public Environment Variables API
 * 
 * This API provides access to public environment variables that are safe to expose.
 * Only NEXT_PUBLIC_* variables are exposed through this endpoint.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  // Only expose variables that start with NEXT_PUBLIC_
  // This ensures we don't accidentally leak sensitive information
  const publicVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string | undefined>);

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DEFAULT_DIRECTORY_SLUG: process.env.DEFAULT_DIRECTORY_SLUG || 'notaryfindernow',
    ...publicVars
  });
}
