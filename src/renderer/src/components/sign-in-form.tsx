import { SignIn } from '@clerk/react'
import { ClerkWidgetFallback } from '@/components/clerk-widget-fallback'
import { clerkAppearance } from '@/lib/clerk-appearance'
import { HOME_PATH } from '@/lib/nav-routes'

/** Clerk sign-in widget: locked light black-and-white card, Urbanist. */
export function SignInForm() {
  return (
    <ClerkWidgetFallback label="Loading sign in">
      <SignIn
        routing="path"
        path="/sign-in"
        appearance={clerkAppearance}
        signUpUrl="/sign-up"
        oauthFlow="popup"
        forceRedirectUrl={HOME_PATH}
        fallbackRedirectUrl={HOME_PATH}
      />
    </ClerkWidgetFallback>
  )
}
