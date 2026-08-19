import { cn } from '@/lib/utils'
import { APP_NAME, APP_URL } from '@/lib/product'

/** Screen-bottom attribution linking to the product site. */
export function ProductFooter({ onDark = false }: { onDark?: boolean }) {
  return (
    <a
      href={APP_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'font-sans text-xs tracking-wide underline-offset-4 transition-colors hover:underline',
        onDark
          ? 'text-white/70 hover:text-white'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      a product of {APP_NAME}
    </a>
  )
}
