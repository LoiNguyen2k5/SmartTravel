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
        ocean: {
          50: '#E6F4F1',
          100: '#CCF0E8',
          200: '#99F6E4',
          500: '#0D9488',
          600: '#0F5264',
          700: '#0B3B49',
          800: '#082E3A',
          900: '#052029',
        },
        coral: {
          50: '#FFF0EB',
          100: '#FFE0D4',
          500: '#D95D39',
          600: '#C24E2D',
          700: '#A13E22',
        },
        primary: {
          50: '#E6F4F1',
          100: '#CCF0E8',
          200: '#99E0D4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0D9488',
          600: '#0F5264',
          700: '#0B3B49',
          800: '#082E3A',
          900: '#06242E',
          950: '#0B3B49',
        },
        accent: {
          50: '#FFF0EB',
          100: '#FFE0D4',
          200: '#FBC2AE',
          300: '#F59E7D',
          400: '#EA7A54',
          500: '#D95D39',
          600: '#C24E2D',
          700: '#A13E22',
          800: '#82311A',
          900: '#642514',
        },
        surface: {
          canvas: '#FAF8F5',
          card: '#FFFFFF',
          subtle: '#F4F1EC',
          muted: '#E6E1DA',
        }
      },
      boxShadow: {
        'subtle': '0 2px 8px 0 rgba(11, 59, 73, 0.05)',
        'card': '0 8px 24px -4px rgba(11, 59, 73, 0.08), 0 2px 6px -1px rgba(11, 59, 73, 0.04)',
        'card-hover': '0 16px 36px -6px rgba(11, 59, 73, 0.14), 0 4px 12px -2px rgba(11, 59, 73, 0.06)',
        'float': '0 24px 48px -12px rgba(11, 59, 73, 0.18)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
