/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        gtd: {
          sand: '#f7f4ec',
          ink: '#162028',
          panel: 'rgba(255, 255, 255, 0.84)',
          night: '#0f1722',
        },
      },
    },
  },
  plugins: [],
};
