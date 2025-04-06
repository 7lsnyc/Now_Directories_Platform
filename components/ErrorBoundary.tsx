'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ConfigError } from '@/lib/errors/ConfigError';
import env from '@/lib/env';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isConfigError: boolean;
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI instead of crashing the whole app when an error occurs.
 * Specifically handles ConfigError differently for a better user experience.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isConfigError: false
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if this is a configuration error
    const isConfigError = error instanceof ConfigError;
    
    // Update state so the next render will show the appropriate fallback UI
    return {
      hasError: true,
      error,
      isConfigError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Here you could also send to an error reporting service
    // Example: reportErrorToService(error, errorInfo);
    
    // Don't report ConfigErrors in production as they're expected when config is missing
    // This prevents flooding error tracking with known configuration issues
    if (env.NODE_ENV === 'production' && error instanceof ConfigError) {
      console.log('Configuration error detected, not reporting to error service');
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isConfigError: false
    });
    
    // Reload the page to ensure a fresh state
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Different UI for configuration errors vs. other errors
      if (this.state.isConfigError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
              <div className="text-center">
                <svg 
                  className="mx-auto h-12 w-12 text-amber-500" 
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
                <h3 className="mt-2 text-xl font-medium text-gray-900">Service Temporarily Unavailable</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We're experiencing some technical difficulties. Please try again later.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Our team has been notified and is working to resolve the issue.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={this.resetError}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
              {env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 border border-amber-200 rounded-md bg-amber-50">
                  <p className="text-sm font-medium text-amber-800 mb-1">Configuration Error:</p>
                  <p className="text-xs font-mono text-amber-600 overflow-auto max-h-40">
                    {this.state.error?.toString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Default fallback UI for other errors
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-theme-primary" 
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
              <h3 className="mt-2 text-xl font-medium text-gray-900">Something went wrong</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please try again or contact support if the issue persists.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={this.resetError}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-theme-primary hover:bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
                >
                  Refresh Page
                </button>
              </div>
            </div>
            {env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-xs font-mono text-gray-600 overflow-auto max-h-40">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
