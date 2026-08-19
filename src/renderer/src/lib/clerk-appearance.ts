const urbanist = 'Urbanist, ui-sans-serif, system-ui, sans-serif'

export type ClerkColorMode = 'light' | 'dark'

const lightPalette = {
  colorPrimary: '#0a0a0a',
  colorTextOnPrimaryBackground: '#ffffff',
  colorBackground: '#ffffff',
  colorText: '#0a0a0a',
  colorTextSecondary: '#525252',
  colorInputBackground: '#ffffff',
  colorInputText: '#0a0a0a',
  colorNeutral: '#737373',
  colorBorder: '#d4d4d4'
} as const

const darkPalette = {
  colorPrimary: '#f5f5f5',
  colorTextOnPrimaryBackground: '#0a0a0a',
  colorBackground: '#1a1a1a',
  colorText: '#f5f5f5',
  colorTextSecondary: '#a3a3a3',
  colorInputBackground: '#262626',
  colorInputText: '#f5f5f5',
  colorNeutral: '#a3a3a3',
  colorBorder: '#404040'
} as const

/**
 * Shared Clerk variables. Auth screens always use the light palette so the
 * white card stays readable even when the app chrome is in dark mode.
 */
export function getClerkAppearance(mode: ClerkColorMode) {
  const palette = mode === 'dark' ? darkPalette : lightPalette

  return {
    layout: {
      socialButtonsVariant: 'blockButton' as const
    },
    variables: {
      ...palette,
      colorModalBackdrop: 'rgba(0, 0, 0, 0.5)',
      fontFamily: urbanist,
      fontFamilyButtons: urbanist,
      borderRadius: '0.625rem'
    },
    elements: {
      rootBox: 'mx-auto font-sans',
      modalBackdrop: 'bg-black/50 backdrop-blur-sm'
    }
  }
}

/**
 * Sign-in / sign-up widget: locked to a light black-and-white card.
 * Uses explicit colors (not semantic Tailwind tokens) so `.dark` on <html>
 * cannot invert button, input, or footer contrast.
 */
export const clerkAppearance = {
  ...getClerkAppearance('light'),
  elements: {
    rootBox: 'mx-auto font-sans',
    card: 'shadow-xl border border-neutral-200',
    cardBox: 'shadow-xl',
    headerTitle: 'font-sans font-bold !text-neutral-950',
    headerSubtitle: 'font-sans !text-neutral-500',
    socialButtonsBlockButton:
      '!bg-white !text-neutral-950 !border !border-neutral-300 hover:!bg-neutral-50',
    socialButtonsBlockButtonText: '!text-neutral-950 font-medium',
    dividerLine: '!bg-neutral-200',
    dividerText: '!text-neutral-500',
    formFieldLabel: '!text-neutral-950',
    formFieldInput:
      '!bg-white !text-neutral-950 !border !border-neutral-300 placeholder:!text-neutral-400',
    formFieldInputShowPasswordButton: '!text-neutral-500 hover:!text-neutral-950',
    formButtonPrimary: '!bg-neutral-950 !text-white hover:!bg-neutral-800',
    footer: '!bg-white !text-neutral-600',
    footerAction: '!bg-white',
    footerActionText: '!text-neutral-600',
    footerActionLink: '!text-neutral-950 hover:!text-neutral-700',
    identityPreviewText: '!text-neutral-950',
    identityPreviewEditButton: '!text-neutral-600',
    formResendCodeLink: '!text-neutral-950',
    otpCodeFieldInput: '!bg-white !text-neutral-950 !border-neutral-300',
    modalBackdrop: 'bg-black/50 backdrop-blur-sm'
  }
}

/** Clerk copy: heading is Welcome instead of the application name. */
export const clerkLocalization = {
  signIn: {
    start: {
      title: 'Welcome',
      titleCombined: 'Welcome'
    }
  },
  signUp: {
    start: {
      title: 'Welcome',
      titleCombined: 'Welcome'
    }
  }
}
