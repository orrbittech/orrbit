import { useState } from 'react'
import { useClerk, useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Power } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { HOVER_OVERLAY_CLASS } from '@/lib/modal-overlay'

/**
 * Abbreviates a display name to first initial + last name, e.g. "Vitor Medeiros" → "V Medeiros".
 */
function abbreviateDisplayName({
  firstName,
  lastName,
  fullName
}: {
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
}): string {
  const first = firstName?.trim()
  const last = lastName?.trim()
  if (first && last) return `${first.charAt(0).toUpperCase()} ${last}`
  if (last) return last
  if (first) return first

  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length >= 2) return `${parts[0].charAt(0).toUpperCase()} ${parts.slice(1).join(' ')}`
  if (parts.length === 1) return parts[0]
  return 'User'
}

export function AppHeader() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { openUserProfile, signOut } = useClerk()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar()
  const sidebarOpen = isMobile ? openMobile : open

  async function handleSignOut() {
    setIsSigningOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  if (!isLoaded || !isSignedIn) return null

  const displayName = abbreviateDisplayName({
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName
  })

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-background px-4 py-3">
      {sidebarOpen ? (
        <div className="size-9 shrink-0" aria-hidden />
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={toggleSidebar}
          className={cn('shrink-0 text-foreground', HOVER_OVERLAY_CLASS)}
        >
          <LayoutDashboard className="size-6" />
        </Button>
      )}

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => openUserProfile?.()}
          aria-label="Manage account"
          className={cn(
            'flex min-w-0 items-center gap-2 rounded-full bg-muted py-1 pl-3 pr-1 text-foreground transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/15'
          )}
        >
          <p className="truncate text-sm font-medium" title={user?.fullName ?? displayName}>
            {displayName}
          </p>
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={user?.imageUrl} alt={displayName} />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          className={cn(
            'shrink-0 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400',
            HOVER_OVERLAY_CLASS
          )}
          onClick={() => {
            void handleSignOut()
          }}
        >
          <Power className="size-5" />
        </Button>
      </div>

      <Dialog open={isSigningOut} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[9999]"
          className="z-[9999] flex min-w-[280px] max-w-[calc(100%-2rem)] items-center justify-center rounded-lg border-0 bg-background px-8 py-6 text-center text-foreground shadow-xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <DialogTitle className="text-lg font-medium text-foreground">Signing you out</DialogTitle>
        </DialogContent>
      </Dialog>
    </header>
  )
}
