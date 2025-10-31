/**
 * Asset path utilities for the games platform
 * These utilities handle base URL resolution for different deployment scenarios
 */

/**
 * Get the platform's base URL
 * This is primarily used in browser environments
 */
export function getBaseUrl(): string {
  // Default base URL for the games platform
  return '/games/';
}

/**
 * Resolve an asset path relative to the platform's base URL
 * @param path - The asset path (should start with /)
 * @returns Full path including base URL
 */
export function resolveAssetPath(path: string): string {
  if (!path) return '';

  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = getBaseUrl();

  // Ensure base URL ends with slash
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return `${normalizedBase}${cleanPath}`;
}

/**
 * Get common asset paths
 */
export const ASSET_PATHS = {
  ICON_DEFAULT: 'images/icons/default.svg',
  ICON_TEMPLATE: 'images/icons/template.svg',
} as const;

/**
 * Get resolved common asset paths
 */
export function getAssetPaths() {
  return {
    iconDefault: resolveAssetPath(ASSET_PATHS.ICON_DEFAULT),
    iconTemplate: resolveAssetPath(ASSET_PATHS.ICON_TEMPLATE),
  };
}
