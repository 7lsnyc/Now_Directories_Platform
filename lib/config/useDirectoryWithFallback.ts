// lib/config/useDirectoryWithFallback.ts — placeholder for MVP starter
'use client';

import { useState, useEffect } from 'react';
import { DirectoryConfig, defaultConfig } from './loadConfig';
import { useDirectoryConfig } from './useDirectoryConfig';

/**
 * Hook that provides directory configuration with fallback values
 * Ensures critical values are always available even if the main config fails to load
 * @param slug The directory slug to load config for
 */
export function useDirectoryWithFallback(slug?: string) {
  const { config, loading, error } = useDirectoryConfig(slug);
  const [fallbackConfig] = useState<DirectoryConfig>(defaultConfig);

  // Merge loaded config with fallback config, ensuring critical values
  const safeConfig = config ? {
    ...fallbackConfig,
    ...config,
    // Ensure nested objects are also merged properly
    logo: {
      ...fallbackConfig.logo,
      ...(config?.logo || {}),
    },
    theme: {
      ...fallbackConfig.theme,
      ...(config?.theme || {}),
      colors: {
        ...fallbackConfig.theme.colors,
        ...(config?.theme?.colors || {}),
      }
    },
    hero: {
      ...fallbackConfig.hero,
      ...(config?.hero || {}),
    },
    navigation: {
      ...fallbackConfig.navigation,
      ...(config?.navigation || {}),
      header: {
        ...fallbackConfig.navigation.header,
        ...(config?.navigation?.header || {}),
        ctaButton: {
          ...fallbackConfig.navigation.header.ctaButton,
          ...(config?.navigation?.header?.ctaButton || {}),
        }
      },
      footer: {
        ...fallbackConfig.navigation.footer,
        ...(config?.navigation?.footer || {}),
        quickLinks: config?.navigation?.footer?.quickLinks || fallbackConfig.navigation.footer.quickLinks,
        services: config?.navigation?.footer?.services || fallbackConfig.navigation.footer.services,
        support: config?.navigation?.footer?.support || fallbackConfig.navigation.footer.support,
      }
    },
    seo: {
      ...fallbackConfig.seo,
      ...(config?.seo || {}),
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