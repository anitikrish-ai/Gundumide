/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary':   '#090a0f',
        'bg-secondary': '#12151e',
        'bg-tertiary':  '#1a1e2b',
        'bg-elevated':  '#23283a',
        'accent': {
          DEFAULT: '#6366f1',
          hover:   '#4f46e5',
          light:   'rgba(99,102,241,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
