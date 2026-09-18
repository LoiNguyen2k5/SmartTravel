/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Be Vietnam Pro"', '"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9fc',
          100: '#ddf2f8',
          200: '#bee5f1',
          300: '#90d1e6',
          400: '#5cb6d6',
          500: '#0284c7', // Aegean Ocean Blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49', // Deep navy marine
          950: '#031926', // Midnight ocean
        },
        accent: {
          50: '#fff8f1',
          100: '#feeedc',
          200: '#fcd9b7',
          300: '#f9bd88',
          400: '#f59654',
          500: '#f97316', // Sunset Amber/Coral
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          canvas: '#FAF9F6', // Warm natural canvas
          card: '#FFFFFF',
          subtle: '#F4F2EC',
          muted: '#EAE7DF',
        }
      },
      boxShadow: {
        'subtle': '0 2px 8px 0 rgba(8, 47, 73, 0.04)',
        'card': '0 8px 24px -4px rgba(8, 47, 73, 0.07), 0 2px 6px -1px rgba(8, 47, 73, 0.03)',
        'card-hover': '0 16px 36px -6px rgba(8, 47, 73, 0.12), 0 4px 12px -2px rgba(8, 47, 73, 0.05)',
        'float': '0 24px 48px -12px rgba(8, 47, 73, 0.18)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
