/**
 * Root Tailwind CSS Configuration
 * CSS-first approach using the unified theme system
 */

import { createSiteConfig } from './core/themes/tailwind.config.js';

export default createSiteConfig({
  // Additional content paths if needed
  content: [
    // Default paths are already included in createSiteConfig
  ],

  // Site-specific theme extensions
  extend: {
    // Add any site-specific customizations here
  },

  // Additional plugins
  plugins: [
    // Add any site-specific plugins here
  ],
});
