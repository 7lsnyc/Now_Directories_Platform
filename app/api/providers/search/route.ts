import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { searchProvidersWithPostGIS } from '@/lib/providerSearch';
import { ProviderSearchParams } from '@/lib/providerSearchClient';

/**
 * API endpoint for searching providers
 * This isolates server-side processing from client components
 */
export async function POST(request: NextRequest) {
  try {
    // Extract search parameters from request body
    const searchParams: ProviderSearchParams = await request.json();
    
    // Server-side validation
    if (!searchParams || !searchParams.directorySlug) {
      return NextResponse.json(
        { error: 'Missing required search parameters' },
        { status: 400 }
      );
    }
    
    if (!searchParams.latitude || !searchParams.longitude) {
      return NextResponse.json(
        { error: 'Missing location coordinates' },
        { status: 400 }
      );
    }
    
    // Log the incoming request parameters
    console.log('SERVER API: Provider search request', {
      directorySlug: searchParams.directorySlug,
      coordinates: `${searchParams.latitude}, ${searchParams.longitude}`,
      radiusMiles: searchParams.radiusMiles,
      filters: {
        serviceType: searchParams.serviceType || 'None',
        minimumRating: searchParams.minimumRating || 'Not applied',
      }
    });
    
    // Execute the search using the server-side function
    // TODO: The SQL function needs to be updated with a higher default page size
    const results = await searchProvidersWithPostGIS(searchParams);
    
    // Log the summary of results
    console.log('SERVER API: Provider search results', {
      providersFound: results.providers.length,
      totalMatching: results.totalCount,
      pageSize: searchParams.pageSize || 'Not specified',
      searchRadiusMiles: results.radiusMiles
    });
    
    // Return results as JSON
    return NextResponse.json(results);
  } catch (error) {
    console.error('SERVER API: Error in provider search:', error);
    
    return NextResponse.json(
      { error: 'Failed to search providers' },
      { status: 500 }
    );
  }
}
