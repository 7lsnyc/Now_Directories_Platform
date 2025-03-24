Updated Implementation Plan for Phase 1
Based on the excellent feedback, here's the refined plan for completing Phase 1:

1. Configuration System Enhancement
Update config/notary.json
Expand with comprehensive configuration:
Theme name (e.g., "blue-notary")
Logo information (path, alt text)
Hero section text (heading, subheading)
Navigation links structure
Service types for dropdown (initially in config, potentially move to Supabase later)
Footer section links and content
SEO metadata (title, description)
Create Additional Example Config
Add config/passport.json with different theming/content
Use this for testing multi-tenant functionality
Finalize Config Loading Utilities
Complete lib/config/loadConfig.ts with proper error handling
Implement fallback mechanism in useDirectoryWithFallback.ts
Add handling for missing slugs: Create default/fallback behavior or 404 page
Focus on JSON loading for Phase 1 (Supabase overrides will come later)
2. Theme Implementation
Define Theme Strategy
Decide between CSS files vs. Tailwind-only approach
For Phase 1, proceed with Tailwind-based theming for simplicity
Update Tailwind Configuration
Enhance tailwind.config.js with:
Custom colors matching designs (blue, orange)
Typography scale
Enable dark mode strategy for future support
Add custom variants for hover, focus, active states
Ensure colors align with the design screenshots provided
Create Global Styles
Update styles/globals.css with base styles
Set up theme class system for dynamic application
3. Core Components Development
Create Reusable UI Components
components/Header.tsx
Logo from config
CTA button ("Request Featured Listing")
Consider placeholder for future auth/login UI
components/Footer.tsx (matching the footer design)
components/SearchBar.tsx
Non-functional in Phase 1 (visual only)
Location input, service dropdown
Structure for later implementation in Phase 3
components/Button.tsx (primary, secondary styles)
components/NotFound.tsx for handling unknown directory slugs
Implement App Router Structure
Create app/directory/[slug]/layout.tsx:
Apply theme based on directory slug
Include Header and Footer components
Set dynamic metadata based on config
Plan for auth/claim UI placement for Phase 2/3
Handle edge cases (invalid slugs)
Implement Directory Homepage
Create app/directory/[slug]/page.tsx:
Hero section with dynamic content from config
Placeholder search form (visual only)
Placeholder sections for featured listings
Responsive design matching the provided screenshots
4. Supabase Basic Setup
Client Setup
Complete the lib/supabase.ts client configuration
Set up environment variables
Document clearly that Phase 1 uses JSON-only with Supabase queries coming in later phases
Schema Design Documentation
Create /docs/database-schema.md with:
Proposed table structure including directory_slug fields
RLS policy documentation for Phase 2
Design for directories table for future config overrides
Notes on how service types may move to Supabase later
5. Testing & Verification
URL Route Testing
Test /directory/notary and /directory/passport
Test handling of unknown slugs (/directory/nonexistent)
Verify theme switching works correctly
Config Loading Tests
Verify configs load properly from JSON
Test error handling and fallbacks
Document test cases for future reference
Responsive Design Testing
Test on mobile, tablet, and desktop viewports
Ensure layouts match design screenshots across devices
Verify any hover/focus states work as expected
6. Documentation Updates
Update Existing Documentation
Update architecture documents with any changes
Document theming strategy decisions
Add screenshots of implemented components
Component Documentation
Create usage examples for Header, Footer, and SearchBar
Document how to add new directories (configs)
Clarify what's coming in future phases
Implementation Order and Priorities
Config System & Error Handling (including 404 case)
Tailwind Config with Theme Support
Layout and Core Components
Page Implementation with Placeholders
Testing Multi-Tenant Functionality
Documentation
This refined approach maintains the original focus on multi-tenant architecture while incorporating valuable feedback about error handling, component structure, and planning for future phases.