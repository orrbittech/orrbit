import { APP_NAME } from '@shared/product'

export interface OnboardingSlide {
  title: string
  body: string
}

/**
 * Reads a Vite env string, falling back when the value is missing or blank.
 * @param key `VITE_*` key declared on `ImportMetaEnv`.
 * @param fallback Copy used when the env value is empty.
 */
function readEnv(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

/**
 * Four marketing slides. Titles and bodies come from `VITE_ONBOARDING_*`.
 * Blank values fall back to lines that include `APP_NAME`.
 */
export const ONBOARDING_SLIDES: readonly OnboardingSlide[] = [
  {
    title: readEnv('VITE_ONBOARDING_1_TITLE', `Welcome to ${APP_NAME}`),
    body: readEnv(
      'VITE_ONBOARDING_1_BODY',
      `Sign in once and pick up ${APP_NAME} on this desktop.`
    )
  },
  {
    title: readEnv('VITE_ONBOARDING_2_TITLE', 'Built for your desk'),
    body: readEnv(
      'VITE_ONBOARDING_2_BODY',
      `A native window with the same ${APP_NAME} account you already use.`
    )
  },
  {
    title: readEnv('VITE_ONBOARDING_3_TITLE', 'Your workspace'),
    body: readEnv(
      'VITE_ONBOARDING_3_BODY',
      'Theme, language, and updates stay with this app on your machine.'
    )
  },
  {
    title: readEnv('VITE_ONBOARDING_4_TITLE', "What's new"),
    body: readEnv(
      'VITE_ONBOARDING_4_BODY',
      `This build of ${APP_NAME} is ready. Open it to see the latest changes.`
    )
  }
]
