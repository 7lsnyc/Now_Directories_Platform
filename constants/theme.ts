/**
 * Theme constants for the Now Directories Platform
 * Centralizes default values for consistent theming across the platform
 */

/**
 * Default theme colors used when directory-specific colors are not available
 */
export const DEFAULT_THEME_COLORS = {
  primary: '#1e40af',     // Blue 800
  secondary: '#1e3a8a',   // Blue 900
  accent: '#f97316',      // Orange 500
  primaryText: '#FFFFFF', // White
  secondaryText: '#FFFFFF', // White
  accentText: '#000000'   // Black
};

/**
 * Platform branding colors
 * Used for the main Now Directories platform
 */
export const PLATFORM_COLORS = {
  primary: '#2563eb',     // Blue 600
  secondary: '#1d4ed8',   // Blue 700
  accent: '#ea580c',      // Orange 600
  muted: '#94a3b8',       // Slate 400
  background: '#f8fafc',  // Slate 50
  foreground: '#0f172a',  // Slate 900
};

/**
 * Typography settings
 */
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  }
};

/**
 * Spacing and layout constants
 */
export const LAYOUT = {
  container: {
    padding: '1rem',
    maxWidth: '1200px',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  }
};
