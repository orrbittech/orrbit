import { AuthPageShell } from '@/components/auth-page-shell'
import { SignUpForm } from '@/components/sign-up-form'

/** Clerk sign-up, with Home back to the Welcome landing. */
export function SignUpPage() {
  return (
    <AuthPageShell showBack>
      <div className="flex w-full max-w-md flex-col items-center justify-center gap-4">
        <SignUpForm />
      </div>
    </AuthPageShell>
  )
}
