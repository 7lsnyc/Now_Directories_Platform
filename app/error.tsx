'use client';

import { useEffect } from 'react';

/**
 * Global error component for Next.js App Router
 * This will catch errors at the route level
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Global route error caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-rose-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="mt-2 text-xl font-medium text-gray-900">Something went wrong</h2>
              <p className="mt-1 text-sm text-gray-500">
                We're sorry, but there was an error loading this page. Please try again.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Try Again
                </button>
              </div>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-xs font-mono text-gray-600 overflow-auto max-h-40">
                  {error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
