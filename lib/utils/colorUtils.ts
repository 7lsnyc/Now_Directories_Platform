/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.0 formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(hexColor: string): number {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  let r, g, b;
  if (color.length === 3) {
    r = parseInt(color.charAt(0) + color.charAt(0), 16) / 255;
    g = parseInt(color.charAt(1) + color.charAt(1), 16) / 255;
    b = parseInt(color.charAt(2) + color.charAt(2), 16) / 255;
  } else {
    r = parseInt(color.substring(0, 2), 16) / 255;
    g = parseInt(color.substring(2, 4), 16) / 255;
    b = parseInt(color.substring(4, 6), 16) / 255;
  }
  
  // If RGB values are sRGB, convert to linear RGB
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Get the appropriate text color (black or white) for a background color
 * Ensures appropriate contrast ratio for accessibility
 */
export function getTextColorForBackground(hexColor: string): string {
  // Handle Tailwind class names (convert to hex)
  if (hexColor.startsWith('bg-')) {
    // This is a simplified mapping of common Tailwind colors
    // In a production environment, you'd want a more comprehensive mapping
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3B82F6',
      'bg-blue-600': '#2563EB',
      'bg-blue-700': '#1D4ED8',
      'bg-red-500': '#EF4444',
      'bg-red-600': '#DC2626',
      'bg-green-500': '#10B981',
      'bg-green-600': '#059669',
      'bg-yellow-500': '#F59E0B',
      'bg-purple-500': '#8B5CF6',
      'bg-purple-600': '#7C3AED',
      'bg-gray-500': '#6B7280',
      'bg-gray-600': '#4B5563',
      'bg-teal-500': '#14B8A6',
      'bg-teal-600': '#0D9488',
      'bg-emerald-500': '#10B981',
      'bg-emerald-600': '#059669',
      'bg-orange-500': '#F97316',
      'bg-orange-600': '#EA580C'
    };
    
    hexColor = colorMap[hexColor] || '#3B82F6'; // Default to blue-500 if not found
  }
  
  // Default to "#000000" if hexColor is invalid
  if (!hexColor.startsWith('#')) {
    hexColor = '#' + hexColor;
  }
  
  // Calculate luminance
  const luminance = getLuminance(hexColor);
  
  // WCAG recommends white text for dark backgrounds and black text for light backgrounds
  // The threshold of 0.5 is a good approximation for the contrast ratio of 4.5:1
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Generate a lighter or darker variant of a color
 * @param hexColor The base color in hex format
 * @param amount Amount to lighten (positive) or darken (negative), from -1 to 1
 */
export function adjustColor(hexColor: string, amount: number): string {
  // Remove # if present
  let color = hexColor.replace('#', '');
  
  // Convert to RGB
  let r, g, b;
  if (color.length === 3) {
    r = parseInt(color.charAt(0) + color.charAt(0), 16);
    g = parseInt(color.charAt(1) + color.charAt(1), 16);
    b = parseInt(color.charAt(2) + color.charAt(2), 16);
  } else {
    r = parseInt(color.substring(0, 2), 16);
    g = parseInt(color.substring(2, 4), 16);
    b = parseInt(color.substring(4, 6), 16);
  }
  
  // Adjust RGB values
  r = Math.max(0, Math.min(255, r + Math.round(amount * 255)));
  g = Math.max(0, Math.min(255, g + Math.round(amount * 255)));
  b = Math.max(0, Math.min(255, b + Math.round(amount * 255)));
  
  // Convert back to hex
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}
