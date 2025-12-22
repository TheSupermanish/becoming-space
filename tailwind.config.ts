import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          DEFAULT: '#C67B5C',
          light: '#D4967D',
          dark: '#A86548',
        },
        sage: {
          DEFAULT: '#8FA68A',
          light: '#A8BBA4',
          dark: '#728C6D',
        },
        bark: {
          DEFAULT: '#3D3631',
          light: '#5A524B',
          dark: '#2A2522',
        },
        stone: {
          DEFAULT: '#6B6259',
          light: '#857B71',
          dark: '#524B44',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F0EBE3',
        },
        sand: {
          DEFAULT: '#E8E2D9',
          dark: '#D9D1C5',
        },
        gold: {
          DEFAULT: '#D4A574',
          light: '#E0BB92',
          dark: '#C08F5C',
        },
        blur: {
          bg: '#F5E6E0',
        },
        // Warm muted purple for Vent mode (replaces indigo)
        dusk: {
          DEFAULT: '#8B7E97',
          50: '#F5F3F7',
          100: '#E8E4ED',
          200: '#D4CDD9',
          300: '#B8AEC2',
          400: '#9B8FA8',
          500: '#8B7E97',
          600: '#736680',
          700: '#5E5369',
          800: '#4A4254',
          900: '#3A3442',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(61, 54, 49, 0.08)',
        warm: '0 8px 30px -4px rgba(198, 123, 92, 0.15)',
        glow: '0 0 20px rgba(198, 123, 92, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(198, 123, 92, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(198, 123, 92, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
