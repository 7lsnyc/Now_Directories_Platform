// lib/config/useDirectoryWithFallback.ts — placeholder for MVP starter
'use client';

import { useState, useEffect } from 'react';
import { DirectoryConfig } from './loadConfig';
import { useDirectoryConfig } from './useDirectoryConfig';

/**
 * Hook that provides directory configuration with fallback values
 * Ensures critical values are always available even if the main config fails to load
 */
export function useDirectoryWithFallback() {
  const { config, loading, error } = useDirectoryConfig();
  const [fallbackConfig] = useState<DirectoryConfig>({
    title: 'Directory',
    description: 'Default directory view',
    theme: {
      primary: '#4B5563', // gray-600
      secondary: '#1F2937', // gray-800
      accent: '#F59E0B', // amber-500
    },
    features: {
      search: true,
      filter: false,
      sort: true,
      pagination: true,
    },
  });

  // Merge loaded config with fallback config, ensuring critical values
  const safeConfig = config ? {
    ...fallbackConfig,
    ...config,
    // Ensure nested objects are also merged properly
    theme: {
      ...fallbackConfig.theme,
      ...(config?.theme || {}),
    },
    features: {
      ...fallbackConfig.features,
      ...(config?.features || {}),
    },
  } : fallbackConfig;

  return {
    config: safeConfig,
    loading,
    error,
    isFallback: !config || !!error,
  };
}