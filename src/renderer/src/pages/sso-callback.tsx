import { useEffect } from 'react'
import { HandleSSOCallback, useAuth } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { finishSignedInNavigation } from '@/lib/auth-navigation'

/** Completes Google OAuth after Clerk redirects back into the app, then lands on in-app home. */
export function SSOCallbackPage() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const timer = window.setTimeout(() => {
      finishSignedInNavigation(navigate)
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="light flex min-h-svh items-center justify-center bg-white font-sans [color-scheme:light]">
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
  )
}
