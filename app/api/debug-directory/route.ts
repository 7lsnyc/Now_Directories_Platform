import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { loadConfig } from '@/lib/config/loadConfig';

/**
 * Simple API endpoint that returns the current directory slug
 * and basic config information for debugging
 */
export async function GET(request: NextRequest) {
  // Get slug from query parameters if provided, otherwise from headers
  const searchParams = request.nextUrl.searchParams;
  const slugFromQuery = searchParams.get('slug');
  
  const headersList = headers();
  const directorySlug = slugFromQuery || headersList.get('x-directory-slug') || 'unknown';
  
  console.log(`[DEBUG API] Requesting debug info for directory: ${directorySlug}`);
  
  try {
    // Load the config for additional debug info - now using await since loadConfig is async
    const config = await loadConfig(directorySlug);
    
    console.log(`[DEBUG API] Config loaded for ${directorySlug}:`, {
      themeName: config.theme?.name || 'unknown',
      primaryColor: config.theme?.colors?.primary || 'unknown',
      title: config.title || 'unknown',
    });
    
    return NextResponse.json({
      directorySlug,
      themeName: config.theme?.name || 'unknown',
      primaryColor: config.theme?.colors?.primary || 'unknown',
      title: config.title || 'unknown',
    });
  } catch (error) {
    console.error(`[DEBUG API] Error loading config for ${directorySlug}:`, error);
    
    return NextResponse.json({
      directorySlug,
      error: 'Failed to load directory configuration',
      themeName: 'unknown',
      primaryColor: 'unknown',
      title: 'unknown',
    }, { status: 500 });
  }
}
