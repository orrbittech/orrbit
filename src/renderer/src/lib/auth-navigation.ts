import { HOME_PATH, SSO_CALLBACK_PATH } from '@/lib/nav-routes'

type NavigateFn = (to: string, options?: { replace?: boolean }) => void

/**
 * True when a hostname is Clerk's hosted Account Portal / Frontend API (the "dev" pages).
 * @param hostname Host from a parsed URL.
 */
function isClerkHostedHostname(hostname: string): boolean {
  return (
    hostname === 'clerk.loro.co.za' ||
    hostname === 'clerk.com' ||
    hostname.endsWith('.clerk.com') ||
    hostname.endsWith('.clerk.accounts.dev') ||
    hostname.endsWith('.accounts.dev')
  )
}

/**
 * Maps a Clerk redirect target onto an in-app path so Chromium never leaves Electron for accounts.dev.
 * Same-origin absolute URLs (http, https, or `orrbit://`) keep their path; Clerk-hosted URLs fall back to home.
 * @param to Relative path or absolute URL from Clerk.
 */
export function toInAppPath(to: string): string {
  if (!to.includes('://')) {
    return to || HOME_PATH
  }

  try {
    const url = new URL(to)
    if (url.origin === window.location.origin) {
      return `${url.pathname}${url.search}${url.hash}` || HOME_PATH
    }
    if (isClerkHostedHostname(url.hostname)) {
      return HOME_PATH
    }
    return HOME_PATH
  } catch {
    return HOME_PATH
  }
}

/**
 * Absolute URL on this renderer origin. Clerk otherwise resolves relative paths against accounts.dev.
 * @param path In-app path beginning with `/`.
 */
export function appOriginUrl(path: string): string {
  return `${window.location.origin}${path}`
}

/** OAuth must return to the renderer SSO route, never Clerk's hosted callback. */
export function ssoCallbackUrl(): string {
  return appOriginUrl(SSO_CALLBACK_PATH)
}

/**
 * Lands the signed-in user on in-app home. If this window is the OAuth popup, the opener is sent home and the popup closes.
 * @param navigate React Router navigate.
 */
export function finishSignedInNavigation(navigate: NavigateFn): void {
  const homeUrl = appOriginUrl(HOME_PATH)

  if (window.opener && !window.opener.closed) {
    try {
      window.opener.location.assign(homeUrl)
    } catch {
      void navigate(HOME_PATH, { replace: true })
      return
    }
    window.close()
    return
  }

  void navigate(HOME_PATH, { replace: true })
}
