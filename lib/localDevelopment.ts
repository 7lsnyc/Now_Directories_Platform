/**
 * Local development configuration
 * 
 * This file contains settings that only apply during local development
 * to make testing easier without requiring multiple domains.
 */

// This defines which directory to load when accessing localhost
// Change this value to test different directories during development
export const LOCAL_DEV_DIRECTORY = 'notaryfindernow';

// This simulates domain-based routing for localhost testing
// Add entries here to test different paths mapping to different directories
export const LOCAL_PATH_TO_DIRECTORY_MAP: Record<string, string> = {
  '/notary': 'notary',
  '/notaryfindernow': 'notaryfindernow',
  '/passport': 'passport',
  // Add more directories as needed for testing
};
