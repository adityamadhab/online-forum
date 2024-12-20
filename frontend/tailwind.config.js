/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          secondary: '#2D2D2D',
          text: '#E4E4E7',
          muted: '#A1A1AA',
          border: '#404040',
          hover: '#2E2E2E',
          accent: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}

