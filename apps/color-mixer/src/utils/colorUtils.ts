import type { RGB, HSL, ColorDefinition } from '@/types';
import { ColorMixingMethod } from '@/types';

// Primary color definitions
export const PRIMARY_COLORS: ColorDefinition[] = [
  { name: 'red', rgb: { r: 255, g: 0, b: 0 }, isPrimary: true },
  { name: 'blue', rgb: { r: 0, g: 0, b: 255 }, isPrimary: true },
  { name: 'green', rgb: { r: 0, g: 255, b: 0 }, isPrimary: true },
  { name: 'white', rgb: { r: 255, g: 255, b: 255 }, isPrimary: true },
];

/**
 * Mix two colors using subtractive method (like paint mixing)
 */
export function mixColorsAverage(color1: RGB, color2: RGB): RGB {
  return {
    r: Math.round((color1.r + color2.r) / 2),
    g: Math.round((color1.g + color2.g) / 2),
    b: Math.round((color1.b + color2.b) / 2),
  };
}

/**
 * Mix two colors using additive method (like light mixing)
 */
export function mixColorsAdditive(color1: RGB, color2: RGB): RGB {
  return {
    r: Math.min(255, color1.r + color2.r),
    g: Math.min(255, color1.g + color2.g),
    b: Math.min(255, color1.b + color2.b),
  };
}

/**
 * Mix two colors using simple addition (clamped at 255)
 */
export function mixColorsSubtractive(color1: RGB, color2: RGB): RGB {
  console.log('Subtractive Mix:', color1, color2);
  console.log(255 - ((255 - color1.r) * (255 - color2.r)) / 255)
  return {
    r: Math.round((color1.r * color2.r) / 255),
    g: Math.round((color1.g * color2.g) / 255),
    b: Math.round((color1.b * color2.b) / 255),
  };
}

/**
 * HSL Interpolation (Finding the Midpoint of Hue)
 */
export function mixColorsHSL(c1: RGB, c2: RGB): RGB {
  console.log('HSL Mix:', c1, c2);
  const hsl1 = rgbToHsl(c1);
  const hsl2 = rgbToHsl(c2);

  // Hue Shortest Direction Interpolation
  let hDiff = hsl2.h - hsl1.h;
  if (hDiff > 180) hDiff -= 360;
  if (hDiff < -180) hDiff += 360;

  const h = (hsl1.h + hDiff / 2 + 360) % 360;
  const s = (hsl1.s + hsl2.s) / 2;
  const l = (hsl1.l + hsl2.l) / 2;

  return hslToRgb({ h, s, l });
}

/**
 * RGB to HSL conversion
 * h: 0-360°, s/l: 0-1
 */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
}

/**
 * HSL → RGB conversion
 */
export function hslToRgb({ h, s, l }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0, g1 = 0, b1 = 0;
  if (0 <= h && h < 60) [r1, g1, b1] = [c, x, 0];
  else if (60 <= h && h < 120) [r1, g1, b1] = [x, c, 0];
  else if (120 <= h && h < 180) [r1, g1, b1] = [0, c, x];
  else if (180 <= h && h < 240) [r1, g1, b1] = [0, x, c];
  else if (240 <= h && h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/**
 * Mix two colors based on the specified method
 */
export function mixColors(color1: RGB, color2: RGB, method: ColorMixingMethod = ColorMixingMethod.SUBTRACTIVE): RGB {
  switch (method) {
    case ColorMixingMethod.ADDITIVE:
      return mixColorsAdditive(color1, color2);
    case ColorMixingMethod.SUBTRACTIVE:
      return mixColorsSubtractive(color1, color2);
    case ColorMixingMethod.AVERAGE:
      return mixColorsAverage(color1, color2);
    case ColorMixingMethod.HSL_INTERPOLATION:
    default:
      return mixColorsHSL(color1, color2);
  }
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
