/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B0F19',
          900: '#111827',
          850: '#151D2F',
          800: '#1E293B',
          700: '#334155'
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669'
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B'
        },
        crimson: {
          400: '#F87171',
          500: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
};
