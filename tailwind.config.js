/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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
