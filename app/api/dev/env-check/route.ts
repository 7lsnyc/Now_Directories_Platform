import { environmentService } from '@/lib/services/EnvironmentService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Diagnostic route to check environment configuration
 * Only available in development mode
 * Protected by API key for security
 */
export async function GET(request: NextRequest) {
  // Skip environment checks during build time
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { message: 'This route is not available in production' },
      { status: 403 }
    );
  }

  // Safe fallback for build time when env vars might not be loaded
  const apiKey = request.headers.get('x-api-key');
  const diagnosticKey = process.env.DIAGNOSTIC_API_KEY || 'dev_diagnostic_key_123';
  if (apiKey !== diagnosticKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Safely initialize environment service with fallbacks for build time
    try {
      environmentService.initialize();
    } catch (initError) {
      console.warn('Environment service initialization failed:', initError);
    }
    
    // Only return non-sensitive information with safe fallbacks
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
