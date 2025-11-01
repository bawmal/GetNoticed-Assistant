/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e7',
          100: '#fde7cf',
          200: '#fbcf9f',
          300: '#f9b76f',
          400: '#f79f3f',
          500: '#f5870f', // GetNoticed orange
          600: '#c46c0c',
          700: '#935109',
          800: '#623606',
          900: '#311b03',
        },
        accent: {
          50: '#f0f4f8',
          100: '#e1e9f1',
          200: '#c3d3e3',
          300: '#a5bdd5',
          400: '#87a7c7',
          500: '#6991b9', // GetNoticed blue
          600: '#547494',
          700: '#3f576f',
          800: '#2a3a4a',
          900: '#151d25',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
