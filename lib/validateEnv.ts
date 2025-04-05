/**
 * Environment variable validation
 * Ensures that all required environment variables are present and correctly formatted
 * This helps prevent deployment failures due to misconfigured environment variables
 */

/**
 * Validates that a URL string is properly formatted
 * @param url The URL to validate
 * @returns True if valid, false otherwise
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Validates that all required environment variables are present and correctly formatted
 * @returns Object containing validation status and any error messages
 */
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required environment variables
  const REQUIRED_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  // Check that all required vars are present
  REQUIRED_VARS.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Validate URL formats
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    errors.push(
      `Invalid URL format for NEXT_PUBLIC_SUPABASE_URL: "${process.env.NEXT_PUBLIC_SUPABASE_URL}". ` +
      `Check for extra spaces or invalid characters.`
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default validateEnvironment;
