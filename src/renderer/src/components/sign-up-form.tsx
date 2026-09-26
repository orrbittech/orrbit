import { SignUp } from '@clerk/react'
import { ClerkWidgetFallback } from '@/components/clerk-widget-fallback'
import { clerkAppearance } from '@/lib/clerk-appearance'
import { HOME_PATH } from '@/lib/nav-routes'

/** Clerk sign-up widget: locked light black-and-white card, Urbanist. */
export function SignUpForm() {
  return (
    <ClerkWidgetFallback label="Loading sign up">
      <SignUp
        routing="path"
        path="/sign-up"
        appearance={clerkAppearance}
        signInUrl="/sign-in"
        oauthFlow="popup"
        forceRedirectUrl={HOME_PATH}
        fallbackRedirectUrl={HOME_PATH}
      />
    </ClerkWidgetFallback>
  )
}
