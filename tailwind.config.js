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
        background: '#0B0B0C',
        surface: '#18181A',
        surfaceHighlight: '#27272A',
        primary: '#4ADE80', 
        primaryDim: 'rgba(74, 222, 128, 0.2)',
        textMain: '#FDFDFD',
        textMuted: '#A1A1AA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
