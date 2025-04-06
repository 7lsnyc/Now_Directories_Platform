/**
 * Error handling utilities for the Now Directories Platform
 * Provides standardized error messages and logging across different parts of the application
 */

// Error types for different categories of errors
export enum ErrorType {
  AUTHENTICATION = 'auth',
  SEARCH = 'search',
  DIRECTORY = 'directory',
  LISTING = 'listing',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

// Interface for structured error responses
export interface ErrorResponse {
  message: string;
  type: ErrorType;
  technical?: string;
  suggestions?: string[];
}

/**
 * Logs an error to the console with consistent formatting
 */
export function logError(error: unknown, context?: string): void {
  console.error(
    `[Now Directories Error]${context ? ` [${context}]` : ''}:`, 
    error instanceof Error ? error : 'Unknown error occurred'
  );
}

/**
 * Creates a standardized error response for authentication errors
 */
export function handleAuthError(error: unknown): ErrorResponse {
  logError(error, ErrorType.AUTHENTICATION);
  
  // Extract error message if available
  const errorMessage = error instanceof Error ? error.message : '';
  
  // Common auth error patterns
  if (errorMessage.includes('credentials')) {
    return {
      message: 'Login failed. Please check your credentials and try again.',
      type: ErrorType.AUTHENTICATION,
      technical: errorMessage,
      suggestions: ['Verify your email address and password', 'Reset your password if you cannot remember it']
    };
  }
  
  if (errorMessage.includes('email') && errorMessage.includes('verified')) {
    return {
      message: 'Please verify your email before logging in.',
      type: ErrorType.AUTHENTICATION,
      technical: errorMessage,
      suggestions: ['Check your email for a verification link', 'Request a new verification email']
    };
  }
  
  // Default auth error
  return {
    message: 'Authentication failed. Please try again.',
    type: ErrorType.AUTHENTICATION,
    technical: errorMessage,
    suggestions: ['Try again in a few moments', 'Contact support if the issue persists']
  };
}

/**
 * Creates a standardized error response for search errors
 */
export function handleSearchError(error: unknown): ErrorResponse {
  logError(error, ErrorType.SEARCH);
  
  const errorMessage = error instanceof Error ? error.message : '';
  
  // Geolocation errors
  if (errorMessage.includes('geolocation') || errorMessage.includes('location')) {
    return {
      message: 'Unable to access your location. Please enter your location manually.',
      type: ErrorType.SEARCH,
      technical: errorMessage,
      suggestions: ['Make sure location services are enabled in your browser', 'Try entering your ZIP code or city name manually']
    };
  }
  
  // No results errors
  if (errorMessage.includes('no results') || errorMessage.includes('not found')) {
    return {
      message: 'No results found. Try adjusting your search criteria.',
      type: ErrorType.SEARCH,
      technical: errorMessage,
      suggestions: ['Widen your search area', 'Try different keywords', 'Remove some filters']
    };
  }
  
  // Default search error
  return {
    message: 'Search failed. Please try again or adjust your filters.',
    type: ErrorType.SEARCH,
    technical: errorMessage,
    suggestions: ['Try again in a few moments', 'Use fewer search filters', 'Check your internet connection']
  };
}

/**
 * Creates a standardized error response for directory data errors
 */
export function handleDirectoryError(error: unknown): ErrorResponse {
  logError(error, ErrorType.DIRECTORY);
  
  return {
    message: 'Unable to load directory information. Please refresh the page.',
    type: ErrorType.DIRECTORY,
    technical: error instanceof Error ? error.message : '',
    suggestions: ['Refresh the page', 'Try again later', 'Check your internet connection']
  };
}

/**
 * Creates a standardized error response for network errors
 */
export function handleNetworkError(error: unknown): ErrorResponse {
  logError(error, ErrorType.NETWORK);
  
  return {
    message: 'Network connection issue. Please check your internet connection and try again.',
    type: ErrorType.NETWORK,
    technical: error instanceof Error ? error.message : '',
    suggestions: ['Check your internet connection', 'Refresh the page', 'Try again in a few moments']
  };
}

/**
 * Creates a standardized error response for any unknown errors
 */
export function handleUnknownError(error: unknown): ErrorResponse {
  logError(error, ErrorType.UNKNOWN);
  
  return {
    message: 'Something went wrong. Please try again.',
    type: ErrorType.UNKNOWN,
    technical: error instanceof Error ? error.message : '',
    suggestions: ['Refresh the page', 'Try again later', 'Contact support if the issue persists']
  };
}
