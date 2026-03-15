/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#eff6ff',
          500: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#eab308',
      },
    },
  },
  plugins: [],
}