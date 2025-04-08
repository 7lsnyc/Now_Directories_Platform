/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Removed ignoreDuringBuilds to enforce code quality and catch ESLint errors
    // during build process
  },
  // Removed the typescript.ignoreBuildErrors setting to enforce type safety
  webpack: (config) => {
    // Ignore specific errors in supabase functions during client-side builds
    // These are deployed separately and not part of the Next.js app
    config.ignoreWarnings = [
      { module: /node_modules\/ws/ }
    ];
    return config;
  },
  // Exclude development-only API routes in production builds
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './app/api/dev/**/*'
      ]
    }
  },
  // Inline non-sensitive environment variables for faster access and smaller bundles
  env: {
    DEFAULT_DIRECTORY_SLUG: process.env.DEFAULT_DIRECTORY_SLUG || 'notaryfindernow',
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true' ? 'true' : 'false',
    DEBUG_MODE: process.env.DEBUG_MODE === 'true' ? 'true' : 'false',
    API_TIMEOUT_MS: process.env.API_TIMEOUT_MS || '10000',
    // Critical: These NEXT_PUBLIC_* variables MUST be passed to the client bundle
    // They are already in Vercel.json, but Next.js needs them explicitly here as well
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }
};

module.exports = nextConfig;
