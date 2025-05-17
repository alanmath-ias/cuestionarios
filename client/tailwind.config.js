// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        borderColor: {
          border: 'hsl(var(--border))',
        },
        colors: {
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
        },
      },
    },
    plugins: [],
  };
  