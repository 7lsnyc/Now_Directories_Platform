'use client';

import { useEffect } from 'react';

/**
 * Error component for the directory route
 * Provides a user-friendly error message with a reset option
 * 
 * This is required by Next.js App Router to handle errors within the /directory route
 * 
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that was thrown
 * @param {Function} props.reset - Function to reset the error boundary
 */
export default function DirectoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Directory route error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-amber-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-2 text-xl font-medium text-gray-900">Directory Error</h2>
          <p className="mt-1 text-sm text-gray-500">
            We encountered a problem loading this directory. This could be due to a temporary issue or missing directory configuration.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Try again"
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
  );
}
