import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ProductFooter } from '@/components/product-footer'

/**
 * Full-page shell for auth routes.
 * Near-black canvas with a local light color-scheme so the Clerk card
 * stays black-on-white regardless of the app theme.
 */
export function AuthPageShell({
  children,
  showBack = false
}: {
  children: ReactNode
  showBack?: boolean
}) {
  return (
    <div className="light relative min-h-svh w-full overflow-hidden bg-[#0a0a0a] font-sans [color-scheme:light]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(255,255,255,0.08),transparent_58%)]"
        aria-hidden
      />

      {showBack && (
        <Link
          to="/"
          className="fixed left-4 top-4 z-20 inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
      )}
      <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-8 pb-16">
        {children}
      </div>
      <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center">
        <ProductFooter onDark />
      </div>
    </div>
  )
}
