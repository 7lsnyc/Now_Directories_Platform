/**
 * Provider component exports
 * This file centralizes exports for all provider-related components
 */

// Export search form and provider list components
export { default as ProviderList } from './ProviderList';
export { default as ProviderSearchForm } from './ProviderSearchForm';

// Re-export types from providerSearchClient for convenience
export type { Coordinates, SearchFilters } from '@/lib/providerSearchClient';
