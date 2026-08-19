import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDesktopSettings } from '@/hooks/use-desktop-settings'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { ThemePreference } from '@shared/app-settings'

/**
 * Apply a theme preference immediately (CSS + persisted desktop settings).
 */
function useApplyTheme() {
  const { setTheme } = useTheme()
  const { patch } = useDesktopSettings()

  return function applyTheme(next: ThemePreference) {
    setTheme(next)
    void patch({ theme: next })
  }
}

export function ModeToggle({
  className,
  contentClassName
}: {
  className?: string
  contentClassName?: string
} = {}) {
  const { resolvedTheme } = useTheme()
  const applyTheme = useApplyTheme()

  if (!resolvedTheme) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        disabled
        className={cn('relative text-sidebar-foreground', className)}
      >
        <Sun className="size-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className={cn(
            'relative text-sidebar-foreground hover:bg-black/5 hover:text-sidebar-foreground dark:hover:bg-white/10',
            className
          )}
        >
          <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(contentClassName ?? 'z-[70]')}>
        <DropdownMenuItem
          onClick={() => {
            applyTheme('light')
          }}
        >
          <Sun className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            applyTheme('dark')
          }}
        >
          <Moon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            applyTheme('system')
          }}
        >
          <Monitor className="size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
