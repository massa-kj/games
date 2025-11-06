/**
 * Unified Tailwind CSS Configuration
 * CSS-first approach - minimal JS config, maximum CSS custom properties
 * True to CSS-first philosophy by keeping configuration lean
 */

/**
 * Minimal base theme that relies on CSS custom properties
 * All design tokens are defined in design-tokens.css for runtime flexibility
 */
const baseTheme = {
  // // Essential Tailwind mappings to CSS custom properties
  // colors: {
  //   transparent: 'transparent',
  //   current: 'currentColor',

  //   // Map Tailwind color scales to our design tokens
  //   neutral: generateColorScale('neutral'),
  //   primary: generateColorScale('primary'),
  //   accent: generateColorScale('accent'),

  //   // Semantic colors
  //   success: 'var(--color-success)',
  //   warning: 'var(--color-warning)',
  //   error: 'var(--color-error)',
  //   info: 'var(--color-info)',

  //   // Contextual colors for common use cases
  //   bg: 'var(--color-bg)',
  //   'bg-secondary': 'var(--color-bg-secondary)',
  //   surface: 'var(--color-surface)',
  //   text: 'var(--color-text)',
  //   border: 'var(--color-border)',
  // },

  // // Map standard Tailwind spacing to our tokens
  // spacing: generateSpacingScale(),

  // // Typography mappings
  // fontFamily: {
  //   sans: 'var(--font-sans)',
  //   serif: 'var(--font-serif)',
  //   mono: 'var(--font-mono)',
  // },
  // fontSize: generateFontSizeScale(),

  // // Other essential mappings
  // borderRadius: generateRadiusScale(),
  // boxShadow: generateShadowScale(),
  // transitionDuration: generateDurationScale(),

  // TODO: Merge with the above
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
};

/**
 * Helper functions to generate Tailwind scales from CSS custom properties
 * These keep the JS config minimal while providing full Tailwind compatibility
 */
function generateColorScale(colorName) {
  const scale = {};
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(weight => {
    scale[weight] = `var(--color-${colorName}-${weight})`;
  });
  scale.DEFAULT = `var(--color-${colorName}-400)`;
  return scale;
}

function generateSpacingScale() {
  const spacing = {};
  // Standard Tailwind spacing
  [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32].forEach(size => {
    const key = size.toString().replace('.', '_');
    spacing[size] = `var(--space-${key})`;
  });
  spacing.px = 'var(--space-px)';

  // Semantic spacing
  ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'].forEach(size => {
    spacing[size] = `var(--space-${size})`;
  });

  return spacing;
}

function generateFontSizeScale() {
  const sizes = {};
  ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'].forEach(size => {
    sizes[size] = `var(--text-${size})`;
  });
  return sizes;
}

function generateRadiusScale() {
  return {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    DEFAULT: 'var(--radius-base)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    '3xl': 'var(--radius-3xl)',
    full: 'var(--radius-full)',
  };
}

function generateShadowScale() {
  return {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    DEFAULT: 'var(--shadow-base)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
    inner: 'var(--shadow-inner)',
    none: 'var(--shadow-none)',
    // Semantic shadows
    card: 'var(--shadow-card)',
    button: 'var(--shadow-button)',
    hover: 'var(--shadow-hover)',
  };
}

function generateDurationScale() {
  return {
    75: 'var(--duration-75)',
    100: 'var(--duration-100)',
    150: 'var(--duration-150)',
    200: 'var(--duration-200)',
    300: 'var(--duration-300)',
    500: 'var(--duration-500)',
    700: 'var(--duration-700)',
    1000: 'var(--duration-1000)',
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
  };
}

/**
 * Configuration factory functions
 * Minimal JS configuration following CSS-first principles
 */
export function createGameConfig({
  content = [],
  extend = {},
  plugins = [],
} = {}) {
  return {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx,vue}",
      "../../core/**/*.{js,ts,jsx,tsx,vue}",
      ...content,
    ],
    theme: {
      ...baseTheme,
      extend: {
      //   // Game-specific extensions (minimal JS, rely on CSS)
      //   scale: {
      //     102: 'var(--feedback-scale-focus)',
      //     105: 'var(--feedback-scale-hover)',
      //     95: 'var(--feedback-scale-active)',
      //   },
      //   minWidth: {
      //     touch: 'var(--touch-target-min)',
      //   },
      //   minHeight: {
      //     touch: 'var(--touch-target-min)',
      //   },
      //   width: {
      //     'card-sm': 'var(--card-size-sm)',
      //     'card-md': 'var(--card-size-md)',
      //     'card-lg': 'var(--card-size-lg)',
      //     'card-xl': 'var(--card-size-xl)',
      //   },
      //   height: {
      //     'card-sm': 'var(--card-size-sm)',
      //     'card-md': 'var(--card-size-md)',
      //     'card-lg': 'var(--card-size-lg)',
      //     'card-xl': 'var(--card-size-xl)',
      //   },
      //   aspectRatio: {
      //     card: 'var(--card-aspect-ratio)',
      //   },
      //   touchAction: {
      //     manipulation: 'manipulation',
      //   },
        ...baseTheme.extend,
        ...extend,
      },
    },
    plugins: [...plugins],
  };
}

export function createSiteConfig({
  content = [],
  extend = {},
  plugins = [],
} = {}) {
  return {
    content: [
      "./site/index.html",
      "./site/src/**/*.{js,ts,jsx,tsx}",
      "./apps/*/index.html",
      "./apps/*/src/**/*.{js,ts,jsx,tsx}",
      "./core/**/*.{js,ts,jsx,tsx}",
      ...content,
    ],
    theme: {
      ...baseTheme,
      extend: {
      //   // Site-specific extensions
      //   scale: {
      //     102: 'var(--feedback-scale-focus)',
      //     105: 'var(--feedback-scale-hover)',
      //     95: 'var(--feedback-scale-active)',
      //   },
        ...baseTheme.extend,
        ...extend,
      },
    },
    plugins: [...plugins],
  };
}

// Lean default export - just the essential theme mappings
export default {
  theme: baseTheme,
};
