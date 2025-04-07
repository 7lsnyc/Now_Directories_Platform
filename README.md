# Now Directories Platform

A Next.js multi-tenant platform for scalable directory listings, currently powering notaryfindernow.com and other directory sites.

## Architecture Overview

The Now Directories Platform uses a multi-tenant architecture designed to scale to 25+ directories by January 2026. Each directory is a separate tenant with its own data, styling, and configuration, but shares the same codebase.

### Key Architectural Components

- **App Router**: Uses Next.js App Router with dynamic routes for multi-tenant support
- **Supabase Backend**: Central database storing all directory configurations and listings
- **Context-Based State Management**: DirectoryContext provides tenant-specific data to components
- **Dynamic Component Loading**: Optimizes performance through selective component loading
- **Strict TypeScript Type Safety**: Ensures reliable code execution and prevents runtime errors

### Directory Structure

```
├── app/
│   ├── directory/
│   │   ├── [slug]/            # Dynamic route for each directory tenant
│   │   │   ├── layout.tsx     # Tenant-specific layout with DirectoryProvider
│   │   │   └── page.tsx       # Main directory page with conditional content rendering
├── components/
│   ├── notary/                # Notary-specific components
│   │   ├── NotaryList.tsx     # Displays filtered notary results
│   │   ├── NotaryListWrapper.tsx  # Context-connected wrapper for NotaryList
│   │   └── NotarySearchForm.tsx   # Search form with geolocation support
├── contexts/
│   ├── directory/
│   │   └── DirectoryContext.tsx   # Manages directory-specific state
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Client-side Supabase client
│   │   └── server.ts          # Server-side Supabase client
├── middleware.ts              # Handles tenant resolution and redirects
└── types/
    └── directory.ts           # Type definitions for directory data
```

### Data Flow

1. **Request Handling**:
   - User visits a domain (e.g., notaryfindernow.com)
   - Middleware intercepts the request and identifies the directory based on hostname
   - Request is directed to the appropriate `[slug]` route

2. **Data Loading**:
   - `layout.tsx` fetches the directory configuration from Supabase
   - DirectoryContext is initialized with the fetched data
   - Components use the DirectoryContext to access tenant-specific data

3. **Search Flow**:
   - User enters location (manually or via geolocation)
   - NotarySearchForm captures search parameters
   - NotaryList queries Supabase for listings based on search criteria
   - Results are filtered, sorted, and displayed to the user

## Adding a New Directory

Follow these steps to add a new directory to the platform:

### 1. Supabase Configuration

Add a new entry to the `directories` table in Supabase:

```sql
INSERT INTO directories (
  name, 
  directory_slug, 
  domain,
  description,
  logo_url,
  primary_color,
  secondary_color,
  is_active
) VALUES (
  'Your Directory Name',
  'your-directory-slug',
  'yourdirectory.com',
  'Description of your directory',
  'https://yourdirectory.com/logo.png',
  '#4F46E5',
  '#E5E7EB',
  true
);
```

### 2. Vercel Domain Configuration

1. Go to your Vercel project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain (e.g., yourdirectory.com)
4. Configure DNS settings as provided by Vercel

### 3. Custom Styling (Optional)

Modify the `components/directory/[slug]/layout.tsx` to include any custom styling for your directory:

```tsx
// Apply directory-specific styling
useEffect(() => {
  if (directory) {
    // Apply primary and secondary colors from the directory configuration
    document.documentElement.style.setProperty('--primary-color', directory.primary_color || '#4F46E5');
    document.documentElement.style.setProperty('--secondary-color', directory.secondary_color || '#E5E7EB');
  }
}, [directory]);
```

### 4. Custom Content (Optional)

If your directory needs custom components beyond the standard listing functionality:

1. Create a specialized component in `components/your-directory/`
2. Update `page.tsx` to conditionally render this component based on the slug:

```tsx
{slug === 'your-directory-slug' ? (
  <YourSpecializedComponent slug={slug} />
) : (
  <GenericDirectoryContent directory={directoryData} />
)}
```

## Resolved Structural Issues

The following structural issues have been addressed in the codebase:

- **Duplicate Components**: Removed redundant `NotaryFinderNow` component, unifying under `NotaryListWrapper`
- **Circular Dependencies**: Ensured proper import structure to avoid circular references
- **Type Inconsistencies**: Implemented strict TypeScript types throughout the codebase
- **Context Mismatches**: DirectoryContext properly provides data to all components
- **Local Fallbacks**: Removed all local development fallbacks, ensuring Supabase is the single source of truth

## Environment Variable Management

The platform uses an optimized environment variable system (`lib/env.ts`) that:
- Pre-computes values at import time to reduce runtime overhead
- Provides friendly error messages when critical variables are missing
- Maintains strict type safety for all variables
- Inlines non-sensitive variables in next.config.js for performance

### Critical Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous API key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

### Optional Environment Variables
- `DEFAULT_DIRECTORY_SLUG` - Default directory to use (defaults to "notary")
- `ENABLE_ANALYTICS` - Enable/disable analytics (defaults to true in production)
- `DEBUG_MODE` - Enable/disable debug features (defaults to true in development)
- `API_TIMEOUT_MS` - API request timeout in milliseconds (defaults to 10000)

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm start

# Run linting
npm run lint
```

## Performance Testing

To test the performance of environment variable access:

1. Run the development server: `npm run dev`
2. Navigate to `/test-env-optimization`
3. View the performance metrics and bundle size impact

## Testing

To ensure the reliability of the platform, we've implemented comprehensive testing:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Test Coverage

- **Unit Tests**: Testing individual components like NotarySearchForm and NotaryListWrapper
- **Integration Tests**: Testing complete workflows like the search functionality
- **Production Testing**: Manual testing of deployed features on live directories

## Deployment

The deployment workflow (`deploy.yml`) runs on every push to the `main` branch. It deploys the application to Vercel.

## Manual Deployment

You can also manually trigger the deployment workflow:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy to Vercel" workflow
3. Click on "Run workflow"
4. Select the branch you want to deploy
5. Click "Run workflow"

## GitHub Actions CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment.

### CI Workflow

The CI workflow (`ci.yml`) runs on every push to the `main` branch and on every pull request. It:

1. Sets up Node.js
2. Installs dependencies
3. Builds the application
4. Tests are currently disabled (uncomment the relevant section in the workflow file when tests are added)

### Deployment Workflow

The deployment workflow (`deploy.yml`) runs on every push to the `main` branch. It deploys the application to Vercel.

## Setting Up Secrets

For the deployment workflow to work, you need to set up the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click on "New repository secret"
4. Add the following secret:
   - Name: `VERCEL_TOKEN`
   - Value: Your Vercel API token (get it from https://vercel.com/account/tokens)
