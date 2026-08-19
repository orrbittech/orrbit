/** Signed-in home after Clerk auth. */
export const HOME_PATH = '/dashboard'

/** Completes Google / OAuth inside the Electron app instead of Clerk's hosted pages. */
export const SSO_CALLBACK_PATH = '/sso-callback'

export const NAV_ROUTES = [
  { path: HOME_PATH, label: 'Home' },
  { path: '/settings', label: 'Settings' }
] as const

export type NavPath = (typeof NAV_ROUTES)[number]['path']
