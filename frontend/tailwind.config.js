/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flores-green': '#4ade80',
        'flores-cyan': '#06b6d4',
        'flores-dark': '#1f2937',
        'flores-orange': '#f97316',
      },
      fontFamily: {
        'flores': ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}