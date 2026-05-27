/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./templates/**/*.ejs', './public/**/*.js'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        sand: { 50: '#fefce8', 100: '#fef9c3' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(12,74,110,0.08)',
        'card-hover': '0 8px 32px 0 rgba(12,74,110,0.16)',
      },
    },
  },
  plugins: [],
}
