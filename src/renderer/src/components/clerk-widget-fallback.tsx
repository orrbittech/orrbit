import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PageLoader, type PageLoaderVariant } from '@/components/page-loader'

const CLERK_WIDGET_SELECTORS = '.cl-card, .cl-cardBox, .cl-main'
const WIDGET_READY_FALLBACK_MS = 4000

/**
 * Shows a loader until Clerk's sign-in/sign-up card is in the DOM.
 * The widget stays mounted (invisible) so Clerk can finish hydrating.
 * @param label Accessible status text.
 * @param variant Canvas color behind the mark.
 * @param children Clerk `<SignIn>` / `<SignUp>` widget.
 */
export function ClerkWidgetFallback({
  children,
  label = 'Loading',
  variant = 'dark'
}: {
  children: ReactNode
  label?: string
  variant?: PageLoaderVariant
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const node = root

    function check() {
      if (node.querySelector(CLERK_WIDGET_SELECTORS)) setIsReady(true)
    }

    check()
    const observer = new MutationObserver(check)
    observer.observe(node, { childList: true, subtree: true })
    const timeout = window.setTimeout(() => setIsReady(true), WIDGET_READY_FALLBACK_MS)

    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <div ref={rootRef} className="relative w-full">
      {!isReady ? (
        <div className="absolute inset-0 z-10 flex min-h-[28rem] items-center justify-center">
          <PageLoader compact variant={variant} label={label} className="bg-transparent" />
        </div>
      ) : null}
      <div className={isReady ? undefined : 'invisible'}>{children}</div>
    </div>
  )
}
