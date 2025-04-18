import { ReactNode } from 'react';
import { DEFAULT_THEME_COLORS } from '@/constants/theme';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  primaryText?: string;
  secondaryText?: string;
  accentText?: string;
}

export interface ThemeProviderProps {
  children: ReactNode;
  directory: string;
  themeColors?: ThemeColors;
  config?: any; // Support for backward compatibility with tests
}

/**
 * ThemeProvider component
 * Sets CSS variables for the directory theme colors
 * For multi-domain architecture, this applies brand colors from the Supabase directories table
 */
export default function ThemeProvider({ children, directory, themeColors, config }: ThemeProviderProps) {
  // For backward compatibility with tests that pass config
  const directoryName = config?.name || directory;
  
  // Use themeColors from config if provided (for test backward compatibility)
  const configThemeColors = config?.theme?.colors;
  const effectiveThemeColors = themeColors || configThemeColors || DEFAULT_THEME_COLORS;
  
  // Use provided themeColors or fallback to defaults
  const { 
    primary = DEFAULT_THEME_COLORS.primary, 
    secondary = DEFAULT_THEME_COLORS.secondary, 
    accent = DEFAULT_THEME_COLORS.accent, 
    primaryText = DEFAULT_THEME_COLORS.primaryText, 
    secondaryText = DEFAULT_THEME_COLORS.secondaryText, 
    accentText = DEFAULT_THEME_COLORS.accentText 
  } = effectiveThemeColors;
  
  return (
    <div 
      className={`theme-provider theme-${directoryName}`}
      data-testid="theme-provider"
      data-directory={directoryName}
      style={{
        // Set theme colors as CSS variables
        '--color-primary': primary,
        '--color-secondary': secondary,
        '--color-accent': accent,
        '--color-primary-text': primaryText,
        '--color-secondary-text': secondaryText,
        '--color-accent-text': accentText,
        // Set theme gradient
        '--gradient-primary': `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
