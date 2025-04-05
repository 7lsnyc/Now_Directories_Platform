import { NextRequest, NextResponse } from 'next/server';
import { middleware, domainMap } from '../middleware';

// Mock NextResponse.next
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn().mockImplementation((config) => ({
        ...config,
        cookies: {
          set: jest.fn(),
        },
      })),
    },
  };
});

describe('Middleware Domain Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ['notaryfindernow.com', 'notary'],
    ['passport.localhost:3003', 'passport'],
    ['localhost:3004', 'platform'],
    ['unknown-domain.com', 'platform'], // should default to platform
  ])('detects correct directory slug for %s', (host, expectedSlug) => {
    // Create mock request with the host
    const mockRequest = {
      headers: {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'host') return host;
          return null;
        }),
      },
    } as unknown as NextRequest;

    // Call middleware
    const response = middleware(mockRequest);
    
    // Check if NextResponse.next was called with correct headers
    expect(NextResponse.next).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          headers: expect.any(Headers),
        }),
      })
    );
    
    // Check if x-directory-slug header is set correctly
    const headers = (NextResponse.next as jest.Mock).mock.calls[0][0].request.headers;
    expect(headers.get('x-directory-slug')).toBe(expectedSlug);
    
    // Check if the cookie is set with the host
    expect(response.cookies.set).toHaveBeenCalledWith(
      'x-host',
      host,
      expect.any(Object)
    );
  });
});

describe('Domain Map Configuration', () => {
  test('contains all required directories', () => {
    // Ensure all key directories are in the map
    expect(domainMap).toHaveProperty('notaryfindernow.com');
    expect(domainMap).toHaveProperty('passporthelpnow.com');
    expect(domainMap).toHaveProperty('nowdirectories.com');
  });
  
  test('maps to correct slugs', () => {
    expect(domainMap['notaryfindernow.com']).toBe('notary');
    expect(domainMap['passporthelpnow.com']).toBe('passport');
    expect(domainMap['nowdirectories.com']).toBe('platform');
  });
});
