/**
 * Type declarations for Next.js components in test environments
 * This helps TypeScript understand the props that Next.js components accept in tests
 */

import React from 'react';

/**
 * Type for Next.js page components with dynamic route parameters
 */
export interface NextPageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
}

/**
 * Type for Next.js layout components with children and dynamic route parameters
 */
export interface NextLayoutProps extends NextPageProps {
  children: React.ReactNode;
}

/**
 * Helper function to properly type a Next.js page component for testing
 * @param Component The Next.js page component
 * @returns The component with proper typing for tests
 */
export function withNextPageProps<P extends NextPageProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return Component;
}

/**
 * Helper function to properly type a Next.js layout component for testing
 * @param Component The Next.js layout component
 * @returns The component with proper typing for tests
 */
export function withNextLayoutProps<P extends NextLayoutProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return Component;
}
