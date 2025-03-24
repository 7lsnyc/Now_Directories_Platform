// lib/config/useDirectoryConfig.ts
'use client';

import { useState, useEffect } from 'react';
import { loadConfig, DirectoryConfig } from './loadConfig';

/**
 * A hook to access and potentially update directory configuration
 * @param slug The directory slug to load config for
 */
export function useDirectoryConfig(slug?: string) {
  const [config, setConfig] = useState<DirectoryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Load the config for the specified slug
      const directoryConfig = loadConfig(slug);
      setConfig(directoryConfig);
      setLoading(false);
    } catch (err) {
      console.error(`Error loading directory configuration for ${slug}:`, err);
      setError(err instanceof Error ? err : new Error(`Unknown error loading config for ${slug}`));
      setLoading(false);
    }
  }, [slug]);

  return {
    config,
    loading,
    error,
    // In a real implementation, this would update the configuration
    updateConfig: (newConfig: Partial<DirectoryConfig>) => {
      if (!config) return;
      setConfig({ ...config, ...newConfig });
    }
  };
}