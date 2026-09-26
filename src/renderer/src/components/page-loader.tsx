import { cn } from '@/lib/utils'

export type PageLoaderVariant = 'app' | 'light' | 'dark'

const VARIANT_CLASS: Record<PageLoaderVariant, string> = {
  app: 'bg-background text-foreground',
  light: 'bg-white text-black',
  dark: 'bg-[#0a0a0a] text-white'
}

/**
 * Orbiting mark used by full-page and inline loaders.
 * @param className Optional size/color overrides.
 */
export function LoaderMark({ className }: { className?: string }) {
  return (
    <div className={cn('relative size-12', className)} aria-hidden>
      <div className="absolute inset-0 rounded-full border border-current/20" />
      <div className="absolute inset-0 animate-spin">
        <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-current" />
      </div>
      <div className="absolute inset-[5px] animate-spin [animation-direction:reverse] [animation-duration:1.35s]">
        <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-current/70" />
      </div>
    </div>
  )
}

/**
 * Centered loading state for auth boot, route transitions, and overlays.
 * @param variant Canvas color. `dark` matches the sign-in shell.
 * @param compact Drops the full-viewport height for inline/widget use.
 * @param label Accessible status text.
 */
export function PageLoader({
  className,
  label = 'Loading',
  variant = 'app',
  compact = false
}: {
  className?: string
  label?: string
  variant?: PageLoaderVariant
  compact?: boolean
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3',
        compact ? 'min-h-0' : 'min-h-svh',
        VARIANT_CLASS[variant],
        className
      )}
    >
      <LoaderMark />
      <span className="sr-only">{label}</span>
    </div>
  )
}
