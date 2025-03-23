// components/builder/ThemeSwitcher.tsx — placeholder for MVP starter
'use client';

import React, { useState } from 'react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // This is just a placeholder - actual theme implementation would go here
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <span className="text-sm text-gray-600">
        {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </div>
  );
}