/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F3EE',
        navy: '#1B2536',
        'accent-orange': '#E8501F',
        'accent-blue': '#3B7DD8',
        'accent-gold': '#D4960F',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Source Serif 4"', 'Spectral', 'Georgia', 'serif'],
      },
      letterSpacing: {
        label: '0.12em',
      },
      borderRadius: {
        card: '2px',
      },
    },
  },
  plugins: [],
};

