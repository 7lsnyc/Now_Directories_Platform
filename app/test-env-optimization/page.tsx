'use client';

import { useState, useEffect } from 'react';
import { clientEnv } from '@/lib/env/client';
import { useSupabase } from '@/lib/supabase/clientProvider';

/**
 * Test page for environment variable optimization
 * Displays environment variables and measures access performance
 */
export default function TestEnvOptimizationPage() {
  const { supabase, isLoading } = useSupabase();
  const [performanceResults, setPerformanceResults] = useState<{
    iterations: number;
    timeMs: number;
    averageAccessTimeMs: number;
  } | null>(null);

  // Variables to display (excluding sensitive ones)
  const variablesToShow = [
    'NODE_ENV',
    'googleAnalyticsId',
    'googleMapsApiKey',
  ];

  // Run performance test
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      const iterations = 10000;
      const start = performance.now();
      
      // Access env variables repeatedly to measure performance
      for (let i = 0; i < iterations; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test1 = clientEnv.NODE_ENV;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test2 = clientEnv.googleAnalyticsId;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test3 = clientEnv.googleMapsApiKey;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test4 = clientEnv.supabase.url;
      }
      
      const end = performance.now();
      const timeMs = end - start;
      
      setPerformanceResults({
        iterations,
        timeMs,
        averageAccessTimeMs: timeMs / iterations
      });
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Environment Variable Optimization Test</h1>
        <p>Loading environment variables...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Environment Variable Optimization Test</h1>
      
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Optimized Environment Variables</h2>
        <div className="space-y-2">
          {variablesToShow.map(key => (
            <div key={key} className="flex">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-4 w-64">{key}:</span>
              <span className="font-mono">{String((clientEnv as any)[key])}</span>
            </div>
          ))}
          <div className="flex">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-4 w-64">supabase.url:</span>
            <span className="font-mono">{clientEnv.supabase.url}</span>
          </div>
        </div>
      </div>
      
      {performanceResults && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Performance Results</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-4 w-64">Iterations:</span>
              <span className="font-mono">{performanceResults.iterations.toLocaleString()}</span>
            </div>
            <div className="flex">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-4 w-64">Total time:</span>
              <span className="font-mono">{performanceResults.timeMs.toFixed(2)} ms</span>
            </div>
            <div className="flex">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-4 w-64">Average access time:</span>
              <span className="font-mono">{(performanceResults.averageAccessTimeMs * 1000000).toFixed(2)} ns</span>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Note: With the new implementation, environment variables are accessed directly through
              the clientEnv object, ensuring they're available when needed while maintaining type safety.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Clean separation between client and server environment variables</li>
          <li>All environment variables accessed through well-typed modules</li>
          <li>Uses Next.js built-in environment variable system</li>
          <li>Proper error handling for missing critical variables</li>
          <li>Supabase client available through React context for optimal performance</li>
        </ul>
      </div>
    </div>
  );
}
