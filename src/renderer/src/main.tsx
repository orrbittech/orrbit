import './globals.css'

import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { ThemeProvider } from '@/components/theme-provider'
import { DesktopSettingsProvider } from '@/components/desktop-settings-provider'
import { getClerkAppearance, clerkLocalization } from '@/lib/clerk-appearance'
import { toInAppPath } from '@/lib/auth-navigation'
import { HOME_PATH, SSO_CALLBACK_PATH } from '@/lib/nav-routes'
import { APP_NAME } from '@/lib/product'
import { RENDERER_SCHEME } from '@shared/renderer-protocol'
import App from './App'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')
}

document.title = APP_NAME

function isGuestAuthPath(pathname: string) {
  return (
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith(SSO_CALLBACK_PATH)
  )
}

/** ClerkProvider inside the router so `routerPush` / `routerReplace` use React Router. */
function ClerkProviderWithRoutes({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { resolvedTheme } = useTheme()
  const appearance = getClerkAppearance(
    isGuestAuthPath(pathname) || resolvedTheme !== 'dark' ? 'light' : 'dark'
  )

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      signInForceRedirectUrl={HOME_PATH}
      signInFallbackRedirectUrl={HOME_PATH}
      signUpForceRedirectUrl={HOME_PATH}
      signUpFallbackRedirectUrl={HOME_PATH}
      allowedRedirectOrigins={[window.location.origin]}
      allowedRedirectProtocols={['http:', 'https:', `${RENDERER_SCHEME}:`]}
      appearance={appearance}
      localization={clerkLocalization}
      routerPush={(to) => navigate(toInAppPath(to))}
      routerReplace={(to) => navigate(toInAppPath(to), { replace: true })}
    >
      {children}
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DesktopSettingsProvider>
        <BrowserRouter>
          <ClerkProviderWithRoutes>
            <App />
          </ClerkProviderWithRoutes>
        </BrowserRouter>
      </DesktopSettingsProvider>
    </ThemeProvider>
  </StrictMode>
)
