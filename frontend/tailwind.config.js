/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        honey: {
          gold: '#FFC30B',
          amber: '#FF8C00',
          brown: '#4A2C2A',
          light: '#FFF8DC',
          dark: '#8B4513',
          'amber-dark': '#D2691E',
        },
        primary: {
          50: '#FFF8DC',
          100: '#FFF8DC',
          200: '#FFE4B5',
          300: '#FFD700',
          400: '#FFC30B',
          500: '#FF8C00',
          600: '#D2691E',
          700: '#8B4513',
          800: '#654321',
          900: '#4A2C2A',
        },
      },
      backgroundImage: {
        'honey-gradient': 'linear-gradient(180deg, #FFF8DC 0%, rgba(255, 215, 0, 0.8) 50%, #FF8C00 100%)',
        'honey-card': 'linear-gradient(135deg, rgba(255, 248, 220, 0.95) 0%, rgba(255, 215, 0, 0.9) 100%)',
        'honey-button': 'linear-gradient(135deg, #FFC30B 0%, #FF8C00 100%)',
      },
      boxShadow: {
        'honey': '0 4px 15px rgba(255, 195, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        'honey-lg': '0 6px 20px rgba(255, 195, 11, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'honey-card': '0 4px 15px rgba(255, 195, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
}

