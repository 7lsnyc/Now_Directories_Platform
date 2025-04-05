'use client';

import { useState, useEffect } from 'react';
import { env } from '@/lib/env';

/**
 * Test page for environment variable optimization
 * Displays environment variables and measures access performance
 */
export default function TestEnvOptimizationPage() {
  const [performanceResults, setPerformanceResults] = useState<{
    iterations: number;
    timeMs: number;
    averageAccessTimeMs: number;
  } | null>(null);

  // Variables to display (excluding sensitive ones)
  const variablesToShow = [
    'NODE_ENV',
    'DEFAULT_DIRECTORY_SLUG',
    'ENABLE_ANALYTICS',
    'DEBUG_MODE',
    'API_TIMEOUT_MS',
  ];

  // Run performance test
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const iterations = 10000;
      const start = performance.now();
      
      // Access env variables repeatedly to measure performance
      for (let i = 0; i < iterations; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test1 = env.DEFAULT_DIRECTORY_SLUG;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test2 = env.ENABLE_ANALYTICS;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test3 = env.DEBUG_MODE;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const test4 = env.API_TIMEOUT_MS;
      }
      
      const end = performance.now();
      const timeMs = end - start;
      
      setPerformanceResults({
        iterations,
        timeMs,
        averageAccessTimeMs: timeMs / iterations
      });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Environment Variable Optimization Test</h1>
      
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Optimized Environment Variables</h2>
        <div className="space-y-2">
          {variablesToShow.map(key => (
            <div key={key} className="flex">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-4 w-64">{key}:</span>
              <span className="font-mono">{String((env as any)[key])}</span>
            </div>
          ))}
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
              Note: With the optimized implementation, environment variables are computed once at import time,
              so access time is near-zero (essentially just object property access).
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Variables are pre-computed at import time rather than on each access</li>
          <li>Bundle size reduced by simplifying the implementation</li>
          <li>Dynamic imports used for components not on critical rendering path</li>
          <li>Critical variables inlined in next.config.js for faster access</li>
          <li>Error handling for missing critical variables maintained</li>
        </ul>
      </div>
    </div>
  );
}
