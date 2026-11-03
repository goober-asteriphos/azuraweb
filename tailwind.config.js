/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sxm: {
          bg: '#0a0b0e',
          surface: '#12151c',
          card: '#181b24',
          'card-hover': '#202430',
          border: '#262b3a',
          accent: '#00e5ff',
          'accent-glow': 'rgba(0, 229, 255, 0.25)',
          blue: '#1e60ff',
          neon: '#00ed82',
          purple: '#9d4edd',
          muted: '#858c9f',
          light: '#f1f3f9'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'glow-accent': '0 0 25px -5px rgba(0, 229, 255, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(30, 96, 255, 0.45)',
        'player': '0 -8px 30px rgba(0, 0, 0, 0.8)',
      },
      keyframes: {
        pulseFast: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        equalizer1: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '18px' },
        },
        equalizer2: {
          '0%, 100%': { height: '16px' },
          '50%': { height: '6px' },
        },
        equalizer3: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '20px' },
        },
      },
      animation: {
        'pulse-fast': 'pulseFast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'eq-1': 'equalizer1 0.8s ease-in-out infinite',
        'eq-2': 'equalizer2 0.6s ease-in-out infinite',
        'eq-3': 'equalizer3 0.7s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
