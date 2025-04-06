'use client';

import React, { useState } from 'react';
import { ConfigError } from '@/lib/errors/ConfigError';
import ErrorBoundary from '@/components/ErrorBoundary';

/**
 * Test page for verifying error boundary functionality
 * This allows us to simulate different error types including configuration errors
 */
export default function TestErrorBoundaryPage() {
  const [errorType, setErrorType] = useState<string | null>(null);

  const triggerConfigError = () => {
    throw new ConfigError('Missing critical environment variable: NEXT_PUBLIC_SUPABASE_URL');
  };

  const triggerRegularError = () => {
    throw new Error('This is a regular error');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Error Boundary Test Page</h1>
      
      <div className="mb-8 p-6 max-w-md bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Select Error Type to Test</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => setErrorType('config')}
            className="w-full px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            Test Config Error
          </button>
          
          <button
            onClick={() => setErrorType('regular')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Test Regular Error
          </button>
        </div>
      </div>
      
      {errorType && (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Error Boundary Result:</h2>
          
          <ErrorBoundary>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
              {errorType === 'config' && triggerConfigError()}
              {errorType === 'regular' && triggerRegularError()}
              <p>You should never see this text. If you do, the error boundary is not working.</p>
            </div>
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
