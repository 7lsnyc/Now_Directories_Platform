/**
 * Diagnostic route to check environment configuration
 * Only available in development mode
 * Protected by API key for security
 */

import { NextRequest, NextResponse } from 'next/server';

// Immediate build detection - resolves at import time
const isBuildTime = typeof process !== 'undefined' && 
  process.env.VERCEL_ENV === 'production' && 
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'undefined';

// For production and build time, export a simplified version that always returns success
// This prevents build errors while still making the route available in development
export async function GET(request: NextRequest) {
  // During build or in production, immediately return success to prevent errors
  if (isBuildTime || process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      status: 'ok',
      message: 'Environmental checks skipped in production/build',
      buildTime: true,
    });
  }

  // Below here only runs in development
  try {
    // Development-only code
    const { environmentService } = await import('@/lib/services/EnvironmentService');

    const apiKey = request.headers.get('x-api-key');
    const diagnosticKey = process.env.DIAGNOSTIC_API_KEY || 'dev_diagnostic_key_123';
    
    if (apiKey !== diagnosticKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      environmentService.initialize();
    } catch (initError) {
      console.warn('Environment service initialization failed:', initError);
      
      return NextResponse.json({
        status: 'error',
        initialized: false,
        error: initError instanceof Error ? initError.message : 'Unknown initialization error',
        nodeEnv: process.env.NODE_ENV || 'unknown',
      });
    }
    
    return NextResponse.json({
      status: 'ok',
      initialized: true,
      hasErrors: environmentService.hasErrors?.() || false,
      errors: environmentService.getErrors?.() || [],
      nodeEnv: process.env.NODE_ENV || 'unknown',
      supabaseConfigured: !environmentService.hasErrors?.() || false,
      directorySlug: environmentService.getValues?.()?.defaults?.directorySlug || 'notaryfindernow',
      analyticsEnabled: environmentService.getValues?.()?.analytics?.enabled || false,
      debugMode: environmentService.getValues?.()?.debug || false
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      nodeEnv: process.env.NODE_ENV || 'unknown',
    }, { status: 500 });
  }
}
