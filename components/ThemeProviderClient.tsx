'use client';

import { FC, ReactNode } from 'react';
import { DirectoryConfig } from '@/lib/config/loadConfig';
import { getTextColorForBackground } from '@/utils/accessibility';

interface ThemeProviderClientProps {
  config: DirectoryConfig;
  children: ReactNode;
}

/**
 * Client-side ThemeProvider component that applies theme colors from config
 * as CSS variables to its children
 */
const ThemeProviderClient: FC<ThemeProviderClientProps> = ({ config, children }) => {
  // Extract theme colors from config
  const primaryColor = config.theme?.colors?.primary || '#1e40af'; // Default blue fallback
  const secondaryColor = config.theme?.colors?.secondary || '#1e3a8a';
  const accentColor = config.theme?.colors?.accent || '#f97316';
  
  // Determine text colors for best contrast
  const primaryTextColor = getTextColorForBackground(primaryColor);
  const secondaryTextColor = getTextColorForBackground(secondaryColor);
  const accentTextColor = getTextColorForBackground(accentColor);
  
  // Apply theme colors as CSS variables
  const themeStyle = {
    // Background colors
    '--color-primary': primaryColor,
    '--color-secondary': secondaryColor,
    '--color-accent': accentColor,
    
    // Text colors for those backgrounds 
    '--color-primary-text': primaryTextColor,
    '--color-secondary-text': secondaryTextColor,
    '--color-accent-text': accentTextColor,
  } as React.CSSProperties;

  return (
    <div className={`theme-${config.name}`} style={themeStyle} data-testid="theme-provider">
      {children}
    </div>
  );
};

export default ThemeProviderClient;
