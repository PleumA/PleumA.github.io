/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Roadmap design system colours (added as extensions, non-breaking)
        primary: '#0d3b66',
        secondary: '#faf0ca',
        accent: '#f4a261',
      },
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
