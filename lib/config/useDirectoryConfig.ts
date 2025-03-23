// lib/config/useDirectoryConfig.ts — placeholder for MVP starter
'use client';

import { useState, useEffect } from 'react';
import { loadConfig, DirectoryConfig } from './loadConfig';

/**
 * A hook to access and potentially update directory configuration
 * This is a placeholder implementation for the MVP
 */
export function useDirectoryConfig() {
  const [config, setConfig] = useState<DirectoryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Load the config
      const directoryConfig = loadConfig();
      setConfig(directoryConfig);
      setLoading(false);
    } catch (err) {
      console.error('Error loading directory configuration:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading config'));
      setLoading(false);
    }
  }, []);

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