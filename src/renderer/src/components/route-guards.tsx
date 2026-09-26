import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/react'
import { PageLoader, type PageLoaderVariant } from '@/components/page-loader'
import { HOME_PATH } from '@/lib/nav-routes'

/**
 * Dark canvas on Clerk auth screens; light on the Welcome landing.
 * @param pathname Current React Router path.
 */
function guestLoaderVariant(pathname: string): PageLoaderVariant {
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) return 'dark'
  return 'light'
}

/** Signed-in only: unsigned users are sent to the Welcome landing. */
export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoaded: isUserLoaded } = useUser()

  if (!isLoaded) return <PageLoader label="Loading" />
  if (!isSignedIn) return <Navigate to="/" replace />
  if (!isUserLoaded) return <PageLoader label="Loading home" />

  return <Outlet />
}

/** Unsigned only: signed-in users are sent into the app home. */
export function GuestRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  const { pathname } = useLocation()
  const variant = guestLoaderVariant(pathname)

  if (!isLoaded) return <PageLoader variant={variant} label="Loading" />

  if (isSignedIn) {
    return (
      <>
        <PageLoader variant={variant} label="Signing you in" />
        <Navigate to={HOME_PATH} replace />
      </>
    )
  }

  return <Outlet />
}

/** Unknown paths: home when signed in, Welcome landing when not. */
export function AuthAwareFallback() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <PageLoader label="Loading" />
  return <Navigate to={isSignedIn ? HOME_PATH : '/'} replace />
}
