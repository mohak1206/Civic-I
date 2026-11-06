/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        page: '#F5F3EE',
        canvas: '#F5F3EE',
        panel: '#1B2536',
        navy: '#1B2536',
        card: '#F5F3EE',
        'card-border': '#D9D5CC',
        'text-heading': '#1B2536',
        'text-body': '#5B6472',
        'text-muted': '#8A919C',
        'accent-orange': '#E8501F',
        'orange-hover': '#CF4416',
        'accent-blue': '#3B7DD8',
        'accent-gold': '#D4960F',
        'accent-green': '#2E9E5B',
        'btn-disabled': '#5B6879',
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
