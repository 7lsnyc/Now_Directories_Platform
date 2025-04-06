'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Client component wrapper for ErrorBoundary
 * This allows us to use the ErrorBoundary in server components
 */
const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper;
