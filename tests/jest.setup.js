// Setup file for Jest
import '@testing-library/jest-dom';

// No need for extend-expect import in newer versions of jest-dom
// It's automatically included in the main import above

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({ slug: 'notary' }),
  notFound: jest.fn(),
}));

// Mock fs module for config loading
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  resolve: jest.fn((_, dir, file) => `${dir}/${file}`),
}));
