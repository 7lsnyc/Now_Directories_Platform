# Now Directories Platform

A Next.js platform for directory listings.

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

## Manual Deployment

You can also manually trigger the deployment workflow:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy to Vercel" workflow
3. Click on "Run workflow"
4. Select the branch you want to deploy
5. Click "Run workflow"

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

### Rollback Plan

If you experience issues with the optimized environment variable system:

1. Replace `lib/env.ts` with the backup version:
   ```bash
   # Assuming you have a backup in lib/env.backup.ts
   cp lib/env.backup.ts lib/env.ts
   ```

2. Revert the inlined environment variables in `next.config.js` by removing the `env` section.

3. Revert any components using dynamic imports (like NotaryListWrapper) to use direct imports.

4. Rebuild and restart the application:
   ```bash
   npm run build && npm start
   ```

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
