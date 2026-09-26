import { useEffect } from 'react'
import { HandleSSOCallback, useAuth } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '@/components/page-loader'
import { finishSignedInNavigation } from '@/lib/auth-navigation'

const SSO_NAVIGATION_FALLBACK_MS = 4000

/** Completes Google OAuth after Clerk redirects back into the app, then lands on in-app home. */
export function SSOCallbackPage() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const timer = window.setTimeout(() => {
      finishSignedInNavigation(navigate)
    }, SSO_NAVIGATION_FALLBACK_MS)

    return () => window.clearTimeout(timer)
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="relative min-h-svh">
      <PageLoader variant="light" label="Completing sign in" />
      <div className="hidden">
        <HandleSSOCallback
          navigateToApp={() => {
            finishSignedInNavigation(navigate)
          }}
          navigateToSignIn={() => {
            void navigate('/sign-in', { replace: true })
          }}
          navigateToSignUp={() => {
            void navigate('/sign-up', { replace: true })
          }}
        />
      </div>
    </div>
  )
}
