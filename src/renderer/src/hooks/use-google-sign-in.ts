import { useState } from 'react'
import { useAuth, useSignIn } from '@clerk/react'
import { ssoCallbackUrl } from '@/lib/auth-navigation'

/**
 * Starts Clerk Google OAuth from the landing page CTA.
 * Both complete and incomplete OAuth returns stay on this origin's `/sso-callback`.
 * @returns Continue handler, pending flag, and a short error message when OAuth fails to start.
 */
export function useGoogleSignIn() {
  const { isLoaded } = useAuth()
  const { signIn } = useSignIn()
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function continueWithGoogle() {
    if (!isLoaded || !signIn) return

    setErrorMessage(null)
    setIsPending(true)

    try {
      const popup = window.open('about:blank', 'clerk-oauth', 'width=500,height=700')
      const callbackUrl = ssoCallbackUrl()
      const { error } = await signIn.sso({
        strategy: 'oauth_google',
        redirectUrl: callbackUrl,
        redirectCallbackUrl: callbackUrl,
        ...(popup ? { popup } : {})
      })

      if (error) {
        setErrorMessage('Google sign-in could not start. Try again, or continue with email.')
        setIsPending(false)
      }
    } catch {
      setErrorMessage('Google sign-in could not start. Try again, or continue with email.')
      setIsPending(false)
    }
  }

  return { continueWithGoogle, isPending, isLoaded, errorMessage }
}
