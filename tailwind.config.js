/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Основные цвета МТС
        'mts-red': '#E30613',      // Основной красный МТС
        'mts-red-dark': '#B30000', // Темно-красный
        'mts-black': '#000000',    // Черный
        'mts-white': '#FFFFFF',    // Белый
        'mts-gray': '#F5F5F5',     // Светло-серый
        
        // Устаревшие цвета (для совместимости)
        'rt-primary': '#E30613',
        'rt-orange':  '#E30613',
        'rt-black':   '#000000',
        'rt-white':   '#FFFFFF',
        'rt-cta':     '#E30613',
        'rt-accent-blue': '#000000',
        'rt-gray-bg': '#F5F5F5',
        'rt-text':    '#000000',
        'rt-disabled-bg':   '#F5F5F5',
        'rt-disabled-text': '#B3B3B3',
      },
      borderRadius: {
        'rt-btn':  '8px',
        'rt-card': '12px',
      },
      boxShadow: {
        'rt-card': '0px 4px 12px rgba(0,0,0,0.05)',
      },
      fontFamily: {
        sans: ['MTS Basis', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
