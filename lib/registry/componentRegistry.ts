/**
 * Component Registry for the Now Directories Platform
 * 
 * This registry maps feature flags to corresponding components,
 * allowing for dynamic component selection based on directory features.
 * 
 * This approach eliminates the need for hardcoded directory slug checks
 * and enables a more scalable architecture for supporting multiple directories.
 */

import { Directory, DirectoryThemeColors } from '@/types/directory';
import React from 'react';

// Define our own generic interfaces for registry components
// These are used for type safety when registering components
export interface BaseSearchFormProps {
  slug: string;
  directoryData: Directory | null;
  themeColors: DirectoryThemeColors;
}

export interface BaseListWrapperProps {
  slug: string;
  directoryData: Directory | null;
  themeColors: DirectoryThemeColors;
  results?: any[];
  loading?: boolean;
}

// Lazy loaded component imports to avoid circular dependencies
import dynamic from 'next/dynamic';

// Notary-specific components
const NotarySearchForm = dynamic(() => import('@/components/notary/NotarySearchForm'));
const NotaryList = dynamic(() => import('@/components/notary/NotaryList'));

// Add other directory-specific components here as they are developed
// Example:
// const LawyerSearchForm = dynamic(() => import('@/components/lawyer/LawyerSearchForm'));
// const LawyerList = dynamic(() => import('@/components/lawyer/LawyerList'));

// For testing the multi-tenant architecture, we're directly reusing notary components
// In a real implementation, we would create plumber-specific components

// Type-safe registry type definitions using React.ComponentType with generic interface
type SearchFormComponentType = React.ComponentType<any>;
type ListWrapperComponentType = React.ComponentType<any>;

/**
 * Registry of search form components mapped to feature flags
 * When adding a new directory with custom search functionality:
 * 1. Add the appropriate feature flag to the directory in Supabase
 * 2. Import the component above
 * 3. Add a mapping here linking the feature to the component
 */
export const searchFormRegistry: Record<string, SearchFormComponentType> = {
  'notary_search': NotarySearchForm,
  'plumber_search': NotarySearchForm, // Reusing notary component for testing
  // Add more mappings as new directories are added:
  // 'lawyer_search': LawyerSearchForm,
};

/**
 * Registry of list wrapper components mapped to feature flags
 * When adding a new directory with custom list functionality:
 * 1. Add the appropriate feature flag to the directory in Supabase
 * 2. Import the component above
 * 3. Add a mapping here linking the feature to the component
 */
export const listWrapperRegistry: Record<string, ListWrapperComponentType> = {
  'notary_search': NotaryList,
  'plumber_search': NotaryList, // Reusing notary component for testing
  // Add more mappings as new directories are added:
  // 'lawyer_search': LawyerList,
};

/**
 * Helper function to get the appropriate search form component based on directory features
 * @param directory The directory data with features array
 * @returns The matching component or undefined if no match found
 */
export function getSearchFormComponent(directory: Directory | null): SearchFormComponentType | undefined {
  if (!directory || !directory.features || !Array.isArray(directory.features)) {
    return undefined;
  }
  
  // Find the first feature that has a matching component in the registry
  const matchingFeature = directory.features.find(feature => feature in searchFormRegistry);
  
  return matchingFeature ? searchFormRegistry[matchingFeature] : undefined;
}

/**
 * Helper function to get the appropriate list wrapper component based on directory features
 * @param directory The directory data with features array
 * @returns The matching component or undefined if no match found
 */
export function getListWrapperComponent(directory: Directory | null): ListWrapperComponentType | undefined {
  if (!directory || !directory.features || !Array.isArray(directory.features)) {
    return undefined;
  }
  
  // Find the first feature that has a matching component in the registry
  const matchingFeature = directory.features.find(feature => feature in listWrapperRegistry);
  
  return matchingFeature ? listWrapperRegistry[matchingFeature] : undefined;
}
