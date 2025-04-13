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
  
  try {
    // Load the config for additional debug info - now using await since loadConfig is async
    const config = await loadConfig(directorySlug);
    
    // Check if the directory was not found
    if (!config || !config.name || config.name === 'default') {
      return NextResponse.json({
        error: `Directory not found for the requested slug: ${directorySlug}`
      }, { status: 404 });
    }
    
    return NextResponse.json({
      directorySlug,
      themeName: config.theme?.name || 'unknown',
      primaryColor: config.theme?.colors?.primary || 'unknown',
      title: config.title || 'unknown',
    });
  } catch (error) {
    // Check if it's a PGRST error (Postgres REST error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isPGRSTError = errorMessage.includes('PGRST');
    
    if (isPGRSTError || errorMessage.includes('not found')) {
      return NextResponse.json({
        error: `Directory not found for the requested slug: ${directorySlug}`
      }, { status: 404 });
    }
    
    return NextResponse.json({
      directorySlug,
      error: 'Failed to load directory configuration',
      themeName: 'unknown',
      primaryColor: 'unknown',
      title: 'unknown',
    }, { status: 500 });
  }
}
