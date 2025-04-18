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

// Provider-agnostic components (replaces notary-specific components)
const ProviderSearchForm = dynamic(() => import('@/components/provider/ProviderSearchForm'));
const ProviderList = dynamic(() => import('@/components/provider/ProviderList'));

// Legacy notary-specific components (kept for reference, will be removed later)
// const NotarySearchForm = dynamic(() => import('@/components/notary/NotarySearchForm'));
// const NotaryList = dynamic(() => import('@/components/notary/NotaryList'));

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
  // Use the provider-agnostic search form for all directory types
  'notary_search': ProviderSearchForm,
  'plumber_search': ProviderSearchForm,
  'lawyer_search': ProviderSearchForm,
  // Add more mappings as needed using the same ProviderSearchForm component
};

/**
 * Registry of list wrapper components mapped to feature flags
 * When adding a new directory with custom list functionality:
 * 1. Add the appropriate feature flag to the directory in Supabase
 * 2. Import the component above
 * 3. Add a mapping here linking the feature to the component
 */
export const listWrapperRegistry: Record<string, ListWrapperComponentType> = {
  // Use the provider-agnostic list for all directory types
  'notary_search': ProviderList,
  'plumber_search': ProviderList,
  'lawyer_search': ProviderList,
  // Add more mappings as needed using the same ProviderList component
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
