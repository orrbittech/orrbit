/**
 * Product branding from env (`VITE_APP_*`), with packaged-safe fallbacks.
 * Used by main, preload, renderer, and electron-builder via the same keys.
 */

function readEnv(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

/** Display name for the window, dock, installer, and in-app copy. */
export const APP_NAME = readEnv('VITE_APP_NAME', 'ORRBIT')

/** Public site used for About, legal links, and installer homepage. */
export const APP_URL = readEnv('VITE_APP_URL', 'https://www.orrbit.co.za/')

/** Marketing / About version; packaged builds also stamp this via extraMetadata. */
export const APP_VERSION = readEnv('VITE_APP_VERSION', '0.1.0')

/**
 * Reverse-DNS id for macOS CFBundleIdentifier and Windows AppUserModelID.
 * Must never fall back to Electron's `com.electron.*` default.
 */
export const APP_ID = readEnv('VITE_APP_ID', 'za.co.orrbit.desktop')

/**
 * Host-only form of `APP_URL` for link labels (e.g. `www.orrbit.co.za`).
 */
export function displayAppUrl(url: string = APP_URL): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}
