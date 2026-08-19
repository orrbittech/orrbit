import { SignUp } from '@clerk/react'
import { clerkAppearance } from '@/lib/clerk-appearance'
import { HOME_PATH } from '@/lib/nav-routes'

/** Clerk sign-up widget: locked light black-and-white card, Urbanist. */
export function SignUpForm() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      oauthFlow="popup"
      forceRedirectUrl={HOME_PATH}
      fallbackRedirectUrl={HOME_PATH}
    />
  )
}
