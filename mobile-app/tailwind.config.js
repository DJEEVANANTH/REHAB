/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#14b8a6', // teal-500
        secondary: '#0f766e', // teal-700
        background: '#041B1A',
        surface: '#0B2B2A',
        'surface-variant': '#133B3A',
        'on-surface': '#F8FAFC',
        'on-surface-variant': '#94A3B8',
        'outline': '#1E4746',
        'outline-variant': '#133B3A',
        error: '#ef4444',
        'error-container': '#450a0a',
        'on-error': '#fecaca'
      }
    },
  },
  plugins: [],
}
