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
