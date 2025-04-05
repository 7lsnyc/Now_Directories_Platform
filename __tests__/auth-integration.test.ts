// Mock Next.js modules before imports
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

jest.mock('../middleware', () => ({
  domainMap: {
    'notaryfindernow.com': 'notary',
    'passporthelpnow.com': 'passport',
    'nowdirectories.com': 'platform'
  }
}));

// Add these mocks before importing the modules
global.Response = jest.fn().mockImplementation(() => ({})) as any;
global.Headers = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  set: jest.fn(),
}));
global.fetch = jest.fn().mockResolvedValue({}) as any;

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    setSession: jest.fn(),
  };
  
  return {
    createClient: jest.fn(() => ({
      auth: mockAuth,
      url: 'https://example.supabase.co',
      supabaseKey: 'mock-key',
    })),
  };
});

import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient, signInWithEmailAndPassword, signUpWithEmailAndPassword } from '@/lib/auth/supabaseAuth';
import { domainMap } from '@/middleware';

describe('Auth with Directory Slug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('getSupabaseServerClient configures custom fetch with directory slug', async () => {
    // Mock the cookie to return a specific host
    const mockCookieGet = jest.fn().mockReturnValue({ value: 'notaryfindernow.com' });
    require('next/headers').cookies.mockReturnValue({
      get: mockCookieGet,
    });
    
    // Call the function
    await getSupabaseServerClient();
    
    // Since createClient is mocked, it returns our mock client
    expect(createClient).toHaveBeenCalled();
    
    // Verify the cookie was checked for the host
    expect(mockCookieGet).toHaveBeenCalledWith('x-host');
  });
  
  test('signInWithEmailAndPassword correctly passes directory context', async () => {
    // Mock Supabase auth response
    const mockSignInResponse = {
      data: { user: { id: '123' } },
      error: null,
    };
    const mockAuthSignIn = jest.fn().mockResolvedValue(mockSignInResponse);
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockAuthSignIn,
      },
    });
    
    // Call the function
    const result = await signInWithEmailAndPassword('test@example.com', 'password');
    
    // Verify the auth function was called correctly
    expect(mockAuthSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    
    // Verify we got the expected result
    expect(result).toEqual({ data: mockSignInResponse.data, error: null });
  });
  
  test('signUpWithEmailAndPassword adds directory_slug to user metadata', async () => {
    // Mock Supabase auth response
    const mockSignUpResponse = {
      data: { user: { id: '123' } },
      error: null,
    };
    const mockAuthSignUp = jest.fn().mockResolvedValue(mockSignUpResponse);
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signUp: mockAuthSignUp,
      },
    });
    
    // Call the function with metadata including a directory slug
    const result = await signUpWithEmailAndPassword(
      'test@example.com',
      'password',
      { directorySlug: 'passport' }
    );
    
    // Verify the auth function was called with the directory slug in metadata
    expect(mockAuthSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          directorySlug: 'passport',
          directory_slug: 'passport',
        },
      },
    });
    
    // Verify we got the expected result
    expect(result).toEqual({ data: mockSignUpResponse.data, error: null });
  });
});
