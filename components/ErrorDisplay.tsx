'use client';

import React from 'react';
import { ErrorResponse } from '@/lib/errors/errorHandling';

interface ErrorDisplayProps {
  error: ErrorResponse;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable component for displaying standardized error messages
 * Provides consistent styling and user feedback across the platform
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-theme-accent" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-gray-900">{error.message}</h3>
          
          {error.suggestions && error.suggestions.length > 0 && (
            <div className="mt-2">
              <ul className="list-disc pl-5 text-xs text-gray-500">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center rounded-md bg-theme-primary px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent"
              >
                Try Again
              </button>
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && error.technical && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <p className="text-xs font-mono text-gray-500 break-words">
                {error.technical}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
