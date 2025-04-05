/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Safelist all background colors used in directory cards
    'bg-blue-400',
    'bg-blue-500',
    'bg-blue-600',
    'bg-blue-700',
    'bg-emerald-500',
    'bg-emerald-700',
    'bg-green-500',
    'bg-green-600',
    'bg-green-700',
    'bg-orange-500',
    'bg-purple-500',
    'bg-purple-600',
    'bg-purple-800',
    'bg-red-400',
    'bg-red-500',
    'bg-red-700',
    'bg-teal-600',
    'bg-yellow-500'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme variable colors (will be set dynamically via CSS variables)
        theme: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
        },
        // Specific directory theme colors (fallbacks and for testing)
        notary: {
          primary: '#1e40af',
          secondary: '#1e3a8a',
          accent: '#f97316',
        },
        passport: {
          primary: '#10803d',   // Example green for passport
          secondary: '#065f46',
          accent: '#ca8a04',    // Example gold accent for passport
        },
      },
      // Custom gradient utilities
      backgroundImage: {
        'theme-gradient': 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
        'notary-gradient': 'linear-gradient(to right, #1e40af, #1e3a8a)',
        'passport-gradient': 'linear-gradient(to right, #10803d, #065f46)',
      },
    },
  },
  plugins: [],
}
