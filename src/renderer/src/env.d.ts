/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_ID?: string
  readonly VITE_ONBOARDING_1_TITLE?: string
  readonly VITE_ONBOARDING_1_BODY?: string
  readonly VITE_ONBOARDING_2_TITLE?: string
  readonly VITE_ONBOARDING_2_BODY?: string
  readonly VITE_ONBOARDING_3_TITLE?: string
  readonly VITE_ONBOARDING_3_BODY?: string
  readonly VITE_ONBOARDING_4_TITLE?: string
  readonly VITE_ONBOARDING_4_BODY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
