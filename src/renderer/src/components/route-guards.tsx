import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { HOME_PATH } from '@/lib/nav-routes'

function AuthSpinner({ light }: { light?: boolean }) {
  return (
    <div
      className={
        light
          ? 'flex min-h-svh items-center justify-center bg-white'
          : 'flex min-h-svh items-center justify-center'
      }
    >
      <div
        className={
          light
            ? 'size-8 animate-spin rounded-full border-2 border-black border-t-transparent'
            : 'size-8 animate-spin rounded-full border-2 border-primary border-t-transparent'
        }
      />
    </div>
  )
}

/** Signed-in only: unsigned users are sent to the Welcome landing. */
export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <AuthSpinner />
  if (!isSignedIn) return <Navigate to="/" replace />

  return <Outlet />
}

/** Unsigned only: signed-in users are sent into the app home. */
export function GuestRoute() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <AuthSpinner light />
  if (isSignedIn) return <Navigate to={HOME_PATH} replace />

  return <Outlet />
}

/** Unknown paths: home when signed in, Welcome landing when not. */
export function AuthAwareFallback() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <AuthSpinner />
  return <Navigate to={isSignedIn ? HOME_PATH : '/'} replace />
}
