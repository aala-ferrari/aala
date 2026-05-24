import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cream base — sito non più nero, ma avorio caldo
        canvas: {
          DEFAULT: '#f6f1e6',      // cream principale
          soft: '#fbf8f0',         // cream chiarissimo (card)
          warm: '#efe7d3',         // cream più caldo (sezioni)
          paper: '#ffffff',        // bianco per superfici alte
        },
        // Navy profondo per testo e contrasti
        ink: {
          DEFAULT: '#15192a',
          soft: '#3a4055',
          dim: '#5a6072',
          mute: '#8a8f9e',
          line: '#e7e0cf',         // linea/divider sul cream
        },
        // Oro raffinato (champagne / brushed gold)
        gold: {
          DEFAULT: '#b08a3e',
          soft: '#c9a849',
          warm: '#d8c08e',
          light: '#ecdcb0',
          deep: '#8a6717',
        },
        // Verticali — toni profondi e ricchi (no pastelli)
        verticals: {
          medical: '#0e7c8a',      // deep teal
          auto: '#a85a1a',         // deep amber
          legal: '#8a6717',        // deep gold
          dental: '#2a7a5c',       // deep sage
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Cormorant Garamond', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(ellipse at top, rgba(176,138,62,0.10), transparent 70%)',
        'paper-grain': 'radial-gradient(circle at 20% 30%, rgba(176,138,62,0.04), transparent 50%), radial-gradient(circle at 80% 70%, rgba(14,25,42,0.03), transparent 50%)',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15,25,42,0.04), 0 8px 30px -10px rgba(15,25,42,0.08)',
        lift: '0 2px 6px rgba(15,25,42,0.06), 0 30px 60px -20px rgba(15,25,42,0.12)',
        gold: '0 10px 30px -10px rgba(176,138,62,0.35)',
        'inner-line': 'inset 0 0 0 1px rgba(231,224,207,0.6)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float': 'float 7s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
