/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#F5A623',
        accent: '#50E3C2',
        light: {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
          text: '#212529'
        },
        dark: {
          DEFAULT: '#121212',
          card: '#1E1E1E',
          text: '#EAEAEA'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
