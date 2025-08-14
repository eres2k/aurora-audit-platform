module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        aurora: {
          blue: '#1976d2',
          green: '#4caf50',
          orange: '#ff9800',
          red: '#f44336',
        }
      }
    },
  },
  plugins: [],
}
