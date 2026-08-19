/** Custom URL scheme for the packaged renderer. Origin is `orrbit://renderer`. */
export const RENDERER_SCHEME = 'orrbit'

/** Host part of the privileged renderer origin. */
export const RENDERER_HOST = 'renderer'

/** Origin Clerk and Chromium use in packaged builds. */
export const RENDERER_ORIGIN = `${RENDERER_SCHEME}://${RENDERER_HOST}`

/** Packaged start URL (`/` so BrowserRouter and Clerk path routing match). */
export const RENDERER_START_URL = `${RENDERER_ORIGIN}/`

/**
 * True when the URL is this app's privileged renderer scheme.
 * @param urlString Navigation, deep-link, or window-open URL.
 */
export function isRendererProtocolUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === `${RENDERER_SCHEME}:` && url.hostname === RENDERER_HOST
  } catch {
    return false
  }
}
