'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import ErrorDisplay from '@/components/ErrorDisplay';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

/**
 * Login form component with integrated error handling
 * Demonstrates using the error handling utilities in authentication flows
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { signIn, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn(email, password);
    
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      } else if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  };

  const handleRetry = () => {
    clearError();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-theme-primary focus:ring-theme-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-theme-primary focus:ring-theme-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} onRetry={handleRetry} />
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme-primary hover:bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
