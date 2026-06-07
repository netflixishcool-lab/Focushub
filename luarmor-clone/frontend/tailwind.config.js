/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luarmor': {
          'dark': '#0f1419',
          'darker': '#0a0e13',
          'primary': '#3b82f6',
          'secondary': '#8b5cf6',
          'danger': '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
