'use client';

import React, { useState } from 'react';

/**
 * Component that intentionally throws errors for testing the ErrorBoundary
 * Only use this in development to verify error handling
 */
const TestErrorComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  // This will trigger the error when the state is set to true
  if (shouldThrow) {
    throw new Error('This is a test error from TestErrorComponent');
  }

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold text-theme-primary">Error Boundary Test</h2>
      <p className="text-gray-600 text-sm">
        Click the button below to trigger an error and test the error boundary.
      </p>
      <button
        className="px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-secondary"
        onClick={() => setShouldThrow(true)}
      >
        Trigger Error
      </button>
    </div>
  );
};

export default TestErrorComponent;
