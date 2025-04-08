/**
 * Diagnostic route to check environment configuration
 * Only available in development mode
 * Protected by API key for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { isBuildTime, buildSafeEnvironment } from './build-safe';
import { serverEnv } from '@/lib/env/server';
import { validateServerEnv } from '@/lib/env/server';

/**
 * GET handler for environment variable diagnostics
 * Uses a build-safe approach that won't fail during build-time
 */
export async function GET(request: NextRequest) {
  // For builds and production environments, use a simplified response
  // that doesn't depend on actual environment variables
  if (isBuildTime || process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      status: 'ok',
      message: 'Environmental checks skipped in production/build',
      buildTime: true,
    });
  }

  // Below here only runs in development
  try {
    const apiKey = request.headers.get('x-api-key');
    const diagnosticKey = process.env.DIAGNOSTIC_API_KEY || 'dev_diagnostic_key_123';
    
    if (apiKey !== diagnosticKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate server environment
    const envValidation = validateServerEnv();
    
    if (!envValidation.isValid) {
      return NextResponse.json({
        status: 'error',
        initialized: false,
        error: `Missing required environment variables: ${envValidation.missingVars.join(', ')}`,
        nodeEnv: process.env.NODE_ENV || 'unknown',
      });
    }
    
    return NextResponse.json({
      status: 'ok',
      initialized: true,
      hasErrors: !envValidation.isValid,
      errors: envValidation.missingVars,
      nodeEnv: process.env.NODE_ENV || 'unknown',
      supabaseConfigured: envValidation.isValid,
      directorySlug: serverEnv.defaultDirectorySlug || 'notaryfindernow',
      analyticsEnabled: serverEnv.enableAnalytics || false,
      debugMode: serverEnv.debugMode || false
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      nodeEnv: process.env.NODE_ENV || 'unknown',
    }, { status: 500 });
  }
}
