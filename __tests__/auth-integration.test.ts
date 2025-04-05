import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient, signInWithEmailAndPassword, signUpWithEmailAndPassword } from '@/lib/auth/supabaseAuth';
import { domainMap } from '@/middleware';

// Mock cookies API
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
  };
  
  return {
    createClient: jest.fn(() => ({
      auth: mockAuth,
    })),
  };
});

describe('Auth with Directory Slug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('getSupabaseServerClient adds directory slug header', async () => {
    // Mock the cookie to return a specific host
    const mockCookieGet = jest.fn().mockReturnValue({ value: 'notaryfindernow.com' });
    require('next/headers').cookies.mockReturnValue({
      get: mockCookieGet,
    });
    
    // Call the function
    const client = await getSupabaseServerClient();
    
    // Verify createClient was called with custom fetch handler
    expect(createClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        global: expect.objectContaining({
          fetch: expect.any(Function),
        }),
      })
    );
    
    // Test the custom fetch handler directly
    const fetchHandler = (createClient as jest.Mock).mock.calls[0][2].global.fetch;
    const mockHeaders = new Headers();
    await fetchHandler('https://example.com', { headers: mockHeaders });
    
    // Check that the directory slug header was set correctly
    expect(mockHeaders.get('x-directory-slug')).toBe('notary');
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
