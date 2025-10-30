import type { RGB, ColorDefinition } from '@/types';

// Primary color definitions
export const PRIMARY_COLORS: ColorDefinition[] = [
  { name: 'red', rgb: { r: 255, g: 0, b: 0 }, isPrimary: true },
  { name: 'blue', rgb: { r: 0, g: 0, b: 255 }, isPrimary: true },
  { name: 'green', rgb: { r: 0, g: 255, b: 0 }, isPrimary: true },
  { name: 'white', rgb: { r: 255, g: 255, b: 255 }, isPrimary: true },
];

/**
 * Mix two colors to generate a new color
 */
export function mixColors(color1: RGB, color2: RGB): RGB {
  return {
    r: Math.round((color1.r + color2.r) / 2),
    g: Math.round((color1.g + color2.g) / 2),
    b: Math.round((color1.b + color2.b) / 2),
  };
}

/**
 * Convert RGB values to CSS color string
 */
export function rgbToString(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Estimate the closest color name from RGB values
 */
export function getColorName(rgb: RGB): string {
  const colorMappings = [
    { name: 'red', rgb: { r: 255, g: 0, b: 0 } },
    { name: 'blue', rgb: { r: 0, g: 0, b: 255 } },
    { name: 'green', rgb: { r: 0, g: 255, b: 0 } },
    { name: 'white', rgb: { r: 255, g: 255, b: 255 } },
    { name: 'purple', rgb: { r: 128, g: 0, b: 128 } },
    { name: 'yellow', rgb: { r: 255, g: 255, b: 0 } },
    { name: 'cyan', rgb: { r: 0, g: 255, b: 255 } },
    { name: 'orange', rgb: { r: 255, g: 128, b: 0 } },
    { name: 'pink', rgb: { r: 255, g: 128, b: 128 } },
    { name: 'lightGreen', rgb: { r: 128, g: 255, b: 128 } },
    { name: 'lightBlue', rgb: { r: 128, g: 128, b: 255 } },
    { name: 'gray', rgb: { r: 128, g: 128, b: 128 } },
    { name: 'darkPurple', rgb: { r: 64, g: 0, b: 128 } },
    { name: 'brown', rgb: { r: 128, g: 64, b: 0 } },
    { name: 'lightGray', rgb: { r: 192, g: 192, b: 192 } },
  ];

  let closestColor = 'unknown';
  let minDistance = Infinity;

  for (const mapping of colorMappings) {
    const distance = Math.sqrt(
      Math.pow(rgb.r - mapping.rgb.r, 2) +
      Math.pow(rgb.g - mapping.rgb.g, 2) +
      Math.pow(rgb.b - mapping.rgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = mapping.name;
    }
  }

  return closestColor;
}

/**
 * Check if two RGB values are equal
 */
export function isEqualRGB(rgb1: RGB, rgb2: RGB): boolean {
  return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b;
}

/**
 * Calculate brightness of RGB values (0-255)
 */
export function getBrightness(rgb: RGB): number {
  return Math.round((rgb.r + rgb.g + rgb.b) / 3);
}

/**
 * Determine text color based on brightness
 */
export function getTextColor(rgb: RGB): string {
  const brightness = getBrightness(rgb);
  return brightness > 128 ? '#333333' : '#ffffff';
}
