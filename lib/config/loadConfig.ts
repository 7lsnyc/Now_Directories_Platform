// lib/config/loadConfig.ts — placeholder for MVP starter

// Define the configuration type
export interface DirectoryConfig {
  title: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: {
    search: boolean;
    filter: boolean;
    sort: boolean;
    pagination: boolean;
  };
}

// Default configuration
const defaultConfig: DirectoryConfig = {
  title: 'Now Directories',
  description: 'A comprehensive platform for managing and exploring directories',
  theme: {
    primary: '#3B82F6', // blue-500
    secondary: '#1E40AF', // blue-800
    accent: '#FCD34D', // amber-300
  },
  features: {
    search: true,
    filter: true,
    sort: true,
    pagination: true,
  },
};

/**
 * Loads configuration from environment, file or defaults
 * This is a placeholder implementation for the MVP
 */
export function loadConfig(): DirectoryConfig {
  // In a real implementation, this would load from a config file or environment variables
  return defaultConfig;
}