import { AuthPageShell } from '@/components/auth-page-shell'
import { SignInForm } from '@/components/sign-in-form'

/** Clerk sign-in, with Home back to the Welcome landing. */
export function SignInPage() {
  return (
    <AuthPageShell showBack>
      <div className="flex w-full max-w-md flex-col items-center justify-center">
        <SignInForm />
      </div>
    </AuthPageShell>
  )
}
