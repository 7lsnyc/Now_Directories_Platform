/**
 * Registry module exports
 * 
 * This index file re-exports everything from the componentRegistry
 * to create a more reliable import path that works consistently
 * across development and production environments.
 * 
 * Benefits:
 * - Standardizes import paths across the application
 * - Improves module resolution reliability in Vercel deployments
 * - Maintains strict TypeScript type safety
 * - Follows Next.js best practices for module organization
 */

export * from './componentRegistry';
