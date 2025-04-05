import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { loadConfig } from '@/lib/config/loadConfig';

/**
 * Simple API endpoint that returns the current directory slug
 * and basic config information for debugging
 */
export async function GET(request: NextRequest) {
  const headersList = headers();
  const directorySlug = headersList.get('x-directory-slug') || 'unknown';
  
  // Load the config for additional debug info
  const config = loadConfig(directorySlug);
  
  return NextResponse.json({
    directorySlug,
    themeName: config.theme?.name || 'unknown',
    primaryColor: config.theme?.colors?.primary || 'unknown',
    title: config.title || 'unknown',
  });
}
