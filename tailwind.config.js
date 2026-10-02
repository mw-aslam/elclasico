/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'dark-bg': '#07090e',
        'dark-surface': '#0c101a',
        'dark-card': '#101524',
        'dark-card-hover': '#161d30',
        'real-gold': '#f5c542',
        'real-gold-dark': '#c89520',
        'neon-blue': '#00f2fe',
        'neon-cyan': '#38bdf8',
        'neon-gold': '#ffd700',
        'pitch-green-dark': '#0a3519',
        'pitch-green-light': '#0f4421',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 242, 254, 0.45)',
        'glow-gold': '0 0 25px rgba(245, 197, 66, 0.5)',
        'glow-subtle': '0 10px 40px -10px rgba(0,0,0,0.7)',
        'card-real': '0 20px 40px -15px rgba(245, 197, 66, 0.25)',
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(135deg, #181d2d 0%, #0d111d 50%, #07090e 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffd700 0%, #f5c542 50%, #d49a1d 100%)',
      }
    },
  },
  plugins: [],
};
