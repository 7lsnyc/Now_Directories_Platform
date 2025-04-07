"use client";

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Directory, DirectoryContextType, DirectoryThemeColors } from '@/types/directory';
import { getTextColorForBackground } from '@/utils/accessibility';

// Create the initial context value
const defaultContextValue: DirectoryContextType = {
  directory: null,
  isLoading: true,
  error: null,
  themeColors: {
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#f97316'
  }
};

// Create the context
const DirectoryContext = createContext<DirectoryContextType>(defaultContextValue);

interface DirectoryProviderProps {
  children: ReactNode;
  initialDirectory?: Directory | null;
}

/**
 * DirectoryProvider component for sharing directory data and theme colors
 * across the directory-specific pages
 * 
 * This context serves as the central source of truth for directory information
 * after it's fetched from Supabase
 */
export function DirectoryProvider({ 
  children, 
  initialDirectory = null 
}: DirectoryProviderProps) {
  const [directory, setDirectory] = useState<Directory | null>(initialDirectory);
  const [isLoading, setIsLoading] = useState<boolean>(!initialDirectory);
  const [error, setError] = useState<Error | null>(null);

  // Calculate theme colors from directory data
  const themeColors: DirectoryThemeColors = {
    primary: directory?.brand_color_primary || '#1e40af',
    secondary: directory?.brand_color_secondary || '#1e3a8a',
    accent: directory?.brand_color_accent || '#f97316',
  };

  // Calculate text colors for accessibility
  themeColors.primaryText = getTextColorForBackground(themeColors.primary);
  themeColors.secondaryText = getTextColorForBackground(themeColors.secondary);
  themeColors.accentText = getTextColorForBackground(themeColors.accent);

  return (
    <DirectoryContext.Provider value={{ 
      directory, 
      isLoading, 
      error, 
      themeColors 
    }}>
      {children}
    </DirectoryContext.Provider>
  );
}

/**
 * Hook to use the directory context
 * 
 * This must be used within a DirectoryProvider component
 */
export function useDirectory(): DirectoryContextType {
  const context = useContext(DirectoryContext);
  
  if (context === undefined) {
    throw new Error('useDirectory must be used within a DirectoryProvider');
  }
  
  return context;
}
