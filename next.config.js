/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Ignore specific errors in supabase functions during client-side builds
    // These are deployed separately and not part of the Next.js app
    config.ignoreWarnings = [
      { module: /node_modules\/ws/ }
    ];
    return config;
  }
};

module.exports = nextConfig;
