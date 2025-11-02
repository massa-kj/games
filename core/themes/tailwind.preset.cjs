/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-secondary': 'var(--color-bg-secondary)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        text: {
          DEFAULT: 'var(--color-text)',
          light: 'var(--color-text-light)',
          white: 'var(--color-text-white)',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        button: 'var(--shadow-button)',
        hover: 'var(--shadow-hover)',
      },
      borderRadius: {
        'custom-sm': 'var(--radius-sm)',
        'custom-md': 'var(--radius-md)',
        'custom-lg': 'var(--radius-lg)',
        'custom-xl': 'var(--radius-xl)',
        'custom-2xl': 'var(--radius-2xl)',
      },
      spacing: {
        'custom-xs': 'var(--spacing-xs)',
        'custom-sm': 'var(--spacing-sm)',
        'custom-md': 'var(--spacing-md)',
        'custom-lg': 'var(--spacing-lg)',
        'custom-xl': 'var(--spacing-xl)',
        'custom-2xl': 'var(--spacing-2xl)',
      },
      fontSize: {
        'custom-xs': 'var(--text-xs)',
        'custom-sm': 'var(--text-sm)',
        'custom-base': 'var(--text-base)',
        'custom-lg': 'var(--text-lg)',
        'custom-xl': 'var(--text-xl)',
        'custom-2xl': 'var(--text-2xl)',
        'custom-3xl': 'var(--text-3xl)',
        'custom-4xl': 'var(--text-4xl)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      },
      borderWidth: {
        '3': '3px',
      },
      scale: {
        '115': '1.15',
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'bounce-in': 'bounce-in 0.5s ease-out',
        'wiggle': 'wiggle 0.8s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '70%': { transform: 'scale(0.9)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
      },
    },
  },
};
