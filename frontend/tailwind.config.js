/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#14213D', paper: '#F5F6F8', brand: { DEFAULT: '#0F766E', dark: '#0B5A54', soft: '#D9F0ED' } },
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
}
