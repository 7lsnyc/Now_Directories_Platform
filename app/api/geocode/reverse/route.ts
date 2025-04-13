import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route Handler for reverse geocoding (coordinates to address)
 * 
 * This route accepts latitude and longitude parameters and returns
 * a formatted address string by securely proxying requests to the
 * Google Maps Geocoding API using our server-side API key.
 */
export async function GET(request: NextRequest) {
  // Extract latitude and longitude from query parameters
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');
  
  // Validate parameters
  if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
    return NextResponse.json(
      { error: 'Invalid latitude or longitude parameters. Both must be valid numbers.' },
      { status: 400 }
    );
  }
  
  // Get API key from environment
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('[Reverse Geocoding API] Missing Google Maps API key');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }
  
  // Construct Google Maps Geocoding API URL
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  
  try {
    // Call Google Maps API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps API responded with status: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Check status from Google API
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Extract the formatted address from the first result
      const formattedAddress = data.results[0].formatted_address;
      return NextResponse.json({ address: formattedAddress });
    } else if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'No address found for coordinates' },
        { status: 404 }
      );
    } else {
      console.error('[Reverse Geocoding API] Google API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: 'Reverse geocoding failed', details: data.status },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Reverse Geocoding API] Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to perform reverse geocoding' },
      { status: 500 }
    );
  }
}
