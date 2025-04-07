/**
 * Directory type definitions for the Now Directories platform
 * These types are used across the application to ensure type safety
 * for directory-related data and operations
 */

/**
 * Directory entity from Supabase directories table
 */
export interface Directory {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Core fields
  name: string;
  directory_slug: string;
  domain: string | null;
  description: string | null;
  
  // Display and branding
  icon_name: string;
  logo_url: string | null;
  icon_url: string | null;
  brand_color_primary: string;
  brand_color_secondary: string | null;
  brand_color_accent: string | null;
  
  // Settings
  is_public: boolean;
  is_searchable: boolean;
  is_active: boolean;
  priority: number;
  
  // Features
  features?: string[];
  default_search_radius?: number;
}

/**
 * Directory theme colors for use with ThemeProvider
 */
export interface DirectoryThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  primaryText?: string;
  secondaryText?: string;
  accentText?: string;
}

/**
 * Directory metadata for use in the platform homepage
 */
export interface DirectoryMetadata {
  title: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  domain?: string;
  isNew?: boolean;
}

/**
 * DirectoryContext interface for the directory context provider
 */
export interface DirectoryContextType {
  directory: Directory | null;
  isLoading: boolean;
  error: Error | null;
  themeColors: DirectoryThemeColors;
}
