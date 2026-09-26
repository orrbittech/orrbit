import { Link } from 'react-router-dom'
import { ChevronRight, Mail } from 'lucide-react'
import { LandingDecor } from '@/components/landing-decor'
import { PageLoader } from '@/components/page-loader'
import { ProductFooter } from '@/components/product-footer'
import { Button } from '@/components/ui/button'
import { useGoogleSignIn } from '@/hooks/use-google-sign-in'
import { APP_URL } from '@/lib/product'

/** Official Google G mark for the OAuth CTA. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.97 6.97 0 0 1 5.48 12c0-.72.13-1.41.36-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  )
}

/** Unsigned home: Welcome headline, Google / email CTAs, and Orrbit attribution. */
export function LandingPage() {
  const { continueWithGoogle, isPending, isLoaded, errorMessage } = useGoogleSignIn()

  return (
    <div className="light relative min-h-svh overflow-hidden bg-[radial-gradient(ellipse_at_center,_#ffffff_0%,_#f4f4f5_72%)] font-sans text-black">
      {isPending ? (
        <div className="fixed inset-0 z-50">
          <PageLoader variant="light" label="Continuing with Google" />
        </div>
      ) : null}

      <LandingDecor />

      <Link
        to="/sign-in"
        className="absolute right-5 top-5 z-20 inline-flex items-center gap-1 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Sign In
        <ChevronRight className="size-4" />
      </Link>

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 py-20">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-black sm:text-6xl">
            Welcome
          </h1>

          <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
            <Button
              type="button"
              size="lg"
              disabled={!isLoaded || isPending}
              onClick={() => void continueWithGoogle()}
              className="h-12 w-full rounded-full bg-black text-base font-medium text-white hover:bg-neutral-800"
            >
              <GoogleMark />
              {isPending ? 'Continuing…' : 'Continue with Google'}
            </Button>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 w-full rounded-full bg-neutral-200 text-base font-medium text-black hover:bg-neutral-300"
            >
              <Link to="/sign-up">
                <Mail className="size-5" />
                Continue with Email
              </Link>
            </Button>
          </div>

          {errorMessage ? (
            <p className="mt-4 max-w-sm text-sm text-neutral-600">{errorMessage}</p>
          ) : null}

          <p className="mt-6 text-sm text-neutral-500">
            By signing up, you agree to our{' '}
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-black"
            >
              Terms
            </a>{' '}
            &{' '}
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-black"
            >
              Privacy
            </a>
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
        <ProductFooter />
      </div>
    </div>
  )
}
