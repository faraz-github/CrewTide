/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CrewTide Ocean Palette 🌊
        navy: {
          950: '#060E1E',
          900: '#0D1F3C',
          800: '#152B52',
          700: '#1A3968',
          600: '#1E4880',
        },
        tide: {
          500: '#2D6DB5',
          400: '#4CA3DD',
          300: '#7EC3EE',
          200: '#AFDAF5',
          100: '#D8EEFC',
        },
        teal: {
          500: '#14B8A6',
          400: '#2DD4BF',
          300: '#5EEAD4',
        },
        coral: {
          500: '#F97316',
          400: '#FB923C',
          300: '#FDBA74',
        },
        foam: '#E8F4FD',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      backgroundImage: {
        'wave-gradient': 'linear-gradient(135deg, #0D1F3C 0%, #152B52 50%, #1A3968 100%)',
        'tide-gradient': 'linear-gradient(135deg, #2D6DB5 0%, #14B8A6 100%)',
        'coral-gradient': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'wave': 'wave 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
