/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#100b72',
        'accent-blue': '#5c56b6',
        'light-gray': '#cccccc',
        'bg-gray': '#d1d1d1',
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '24px',
        '2xl': '32px',
      },
    },
  },
  plugins: [],
}
