/**
 * Accessibility utility functions for validating color contrasts according to WCAG guidelines
 */

/**
 * Convert hex color to RGB values
 * @param hex Hex color code (e.g., #ffffff or #fff)
 * @returns RGB values as {r, g, b}
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  let r, g, b;
  if (hex.length === 3) {
    // Short form like #fff
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    // Full form like #ffffff
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error('Invalid hex color format');
  }

  return { r, g, b };
}

/**
 * Calculate relative luminance of a color
 * @param color RGB color values
 * @returns Relative luminance
 */
export function getLuminance(color: { r: number; g: number; b: number }): number {
  // Convert RGB to sRGB
  const sRGB = {
    r: color.r / 255,
    g: color.g / 255,
    b: color.b / 255,
  };

  // Apply transformation
  const rgb = {
    r: sRGB.r <= 0.03928 ? sRGB.r / 12.92 : Math.pow((sRGB.r + 0.055) / 1.055, 2.4),
    g: sRGB.g <= 0.03928 ? sRGB.g / 12.92 : Math.pow((sRGB.g + 0.055) / 1.055, 2.4),
    b: sRGB.b <= 0.03928 ? sRGB.b / 12.92 : Math.pow((sRGB.b + 0.055) / 1.055, 2.4),
  };

  // Calculate luminance
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

/**
 * Calculate contrast ratio between two colors according to WCAG 2.1
 * @param color1 First color in hex format (e.g., #ffffff)
 * @param color2 Second color in hex format (e.g., #000000)
 * @returns Contrast ratio (higher is better, 1 is minimum, 21 is maximum)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);

  // Ensure lighter color is first for calculation
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  // Calculate contrast ratio: (L1 + 0.05) / (L2 + 0.05)
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA contrast requirements
 * @param foreground Foreground color in hex format
 * @param background Background color in hex format
 * @param isLargeText Whether the text is large (at least 18pt or 14pt bold)
 * @returns true if the combination meets WCAG AA requirements
 */
export function meetsWcagAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Check if a color combination meets WCAG AAA contrast requirements
 * @param foreground Foreground color in hex format
 * @param background Background color in hex format
 * @param isLargeText Whether the text is large (at least 18pt or 14pt bold)
 * @returns true if the combination meets WCAG AAA requirements
 */
export function meetsWcagAAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7.0;
}

/**
 * Suggest an alternative color with better contrast if the original doesn't meet requirements
 * @param foreground Original foreground color in hex format
 * @param background Background color in hex format
 * @param targetRatio Minimum contrast ratio to achieve
 * @returns A new color with better contrast, or the original if it meets requirements
 */
export function suggestAccessibleColor(foreground: string, background: string, targetRatio = 4.5): string {
  const currentRatio = getContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return foreground; // Already meets requirements
  }
  
  // This is a simplified approach - a real implementation would be more sophisticated
  // by adjusting lightness/darkness while preserving hue
  const rgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  // Determine if we need to lighten or darken based on background
  const bgLuminance = getLuminance(bgRgb);
  
  if (bgLuminance > 0.5) {
    // Dark text on light background - darken the text
    return darkenColor(foreground, targetRatio, background);
  } else {
    // Light text on dark background - lighten the text
    return lightenColor(foreground, targetRatio, background);
  }
}

/**
 * Darken a color until it meets the target contrast ratio with the background
 * @param color Color to darken in hex format
 * @param targetRatio Target contrast ratio
 * @param background Background color to compare against
 * @returns Darkened color in hex format
 */
function darkenColor(color: string, targetRatio: number, background: string): string {
  const rgb = hexToRgb(color);
  let ratio = getContrastRatio(color, background);
  let attempts = 0;
  
  // Adjust color until we meet the target ratio or reach maximum attempts
  while (ratio < targetRatio && attempts < 20) {
    rgb.r = Math.max(0, rgb.r - 10);
    rgb.g = Math.max(0, rgb.g - 10);
    rgb.b = Math.max(0, rgb.b - 10);
    
    const newColor = rgbToHex(rgb);
    ratio = getContrastRatio(newColor, background);
    attempts++;
    
    if (ratio >= targetRatio) {
      return newColor;
    }
  }
  
  // Return the darkest possible if we couldn't meet the target
  return '#000000';
}

/**
 * Lighten a color until it meets the target contrast ratio with the background
 * @param color Color to lighten in hex format
 * @param targetRatio Target contrast ratio
 * @param background Background color to compare against
 * @returns Lightened color in hex format
 */
function lightenColor(color: string, targetRatio: number, background: string): string {
  const rgb = hexToRgb(color);
  let ratio = getContrastRatio(color, background);
  let attempts = 0;
  
  // Adjust color until we meet the target ratio or reach maximum attempts
  while (ratio < targetRatio && attempts < 20) {
    rgb.r = Math.min(255, rgb.r + 10);
    rgb.g = Math.min(255, rgb.g + 10);
    rgb.b = Math.min(255, rgb.b + 10);
    
    const newColor = rgbToHex(rgb);
    ratio = getContrastRatio(newColor, background);
    attempts++;
    
    if (ratio >= targetRatio) {
      return newColor;
    }
  }
  
  // Return the lightest possible if we couldn't meet the target
  return '#ffffff';
}

/**
 * Determine if a background color should use white or black text for best contrast
 * @param backgroundColor Background color in hex format
 * @returns '#ffffff' for white text or '#000000' for black text
 */
export function getTextColorForBackground(backgroundColor: string): string {
  // Calculate the luminance of the background color
  const rgb = hexToRgb(backgroundColor);
  const luminance = getLuminance(rgb);

  // If the background is dark (low luminance), use white text
  // The threshold of 0.5 is commonly used - colors with luminance < 0.5 get white text
  return luminance < 0.5 ? '#ffffff' : '#000000';
}

/**
 * Convert RGB values back to hex color
 * @param rgb RGB values as {r, g, b}
 * @returns Hex color code
 */
function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
}

/**
 * Convert a single RGB component to hex
 * @param c RGB component (0-255)
 * @returns Hex representation
 */
function componentToHex(c: number): string {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}
