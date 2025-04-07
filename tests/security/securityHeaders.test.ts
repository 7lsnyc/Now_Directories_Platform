import { NextRequest, NextResponse } from 'next/server';
import { addSecurityHeaders, applyCorsPolicies } from '../../lib/security/securityMiddleware';

// Type for our mock headers store
interface MockHeadersStore {
  [key: string]: string;
}

// Mock NextResponse constructor
const mockNextResponse = () => {
  const headersStore: MockHeadersStore = {};
  return {
    headers: {
      set: (key: string, value: string) => {
        headersStore[key] = value;
      },
      get: (key: string) => headersStore[key],
      // Custom method for tests
      getAllHeaders: () => headersStore
    }
  } as unknown as NextResponse;
};

// Mock NextRequest constructor
const mockNextRequest = (origin?: string) => {
  const headers = new Map();
  if (origin) {
    headers.set('origin', origin);
  }
  return {
    headers: {
      get: (key: string) => headers.get(key)
    }
  } as unknown as NextRequest;
};

describe('Security Headers Tests', () => {
  test('Should add all required security headers', () => {
    const response = mockNextResponse();
    const result = addSecurityHeaders(response);
    
    // Get all headers using our custom method
    const headers = (result.headers as any).getAllHeaders();
    
    // Check that all security headers are present
    expect(headers['Content-Security-Policy']).toBeDefined();
    expect(headers['Strict-Transport-Security']).toBeDefined();
    expect(headers['X-Frame-Options']).toBeDefined();
    expect(headers['X-Content-Type-Options']).toBeDefined();
    expect(headers['Referrer-Policy']).toBeDefined();
    expect(headers['Permissions-Policy']).toBeDefined();
    
    // Check specific values
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    
    // In development, X-Frame-Options should be SAMEORIGIN
    if (process.env.NODE_ENV === 'development') {
      expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    } else {
      expect(headers['X-Frame-Options']).toBe('DENY');
    }
  });
  
  test('Should apply CORS policies correctly for allowed origins', () => {
    // Test with allowed origin
    const allowedResponse = mockNextResponse();
    const allowedRequest = mockNextRequest('https://notaryfindernow.com');
    
    const result = applyCorsPolicies(allowedRequest, allowedResponse);
    const headers = (result.headers as any).getAllHeaders();
    
    expect(headers['Access-Control-Allow-Origin']).toBe('https://notaryfindernow.com');
    expect(headers['Access-Control-Allow-Methods']).toBeDefined();
    expect(headers['Access-Control-Allow-Headers']).toBeDefined();
  });
  
  test('Should not apply CORS headers for disallowed origins', () => {
    // Test with disallowed origin
    const disallowedResponse = mockNextResponse();
    const disallowedRequest = mockNextRequest('https://malicious-site.com');
    
    const result = applyCorsPolicies(disallowedRequest, disallowedResponse);
    const headers = (result.headers as any).getAllHeaders();
    
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
});
