import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../core/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [
    require('../../core/themes/tailwind.preset.cjs')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
