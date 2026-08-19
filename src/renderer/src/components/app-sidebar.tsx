import type { ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { LayoutDashboard, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarThemeToggle,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { NAV_ROUTES } from '@/lib/nav-routes'

const ROUTE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  '/dashboard': LayoutDashboard,
  '/settings': Settings
}

export function AppSidebar() {
  const location = useLocation()
  const { closeSidebar } = useSidebar()
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded || !isSignedIn) return null

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="relative flex h-14 w-full shrink-0 flex-row items-center justify-end border-b border-sidebar-border px-3 md:px-4">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="justify-center md:justify-start">
        <SidebarGroup>
          <SidebarGroupContent className="w-full">
            <SidebarMenu className="items-center md:items-stretch">
              {NAV_ROUTES.map((route) => {
                const Icon = ROUTE_ICONS[route.path]
                const isActive =
                  location.pathname === route.path || location.pathname.startsWith(`${route.path}/`)

                return (
                  <SidebarMenuItem key={route.path} className="w-full">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="justify-center text-center md:justify-start md:text-left"
                    >
                      <Link
                        to={route.path}
                        onClick={closeSidebar}
                        className="w-full justify-center md:justify-start"
                      >
                        {Icon && <Icon className="size-5 shrink-0" />}
                        <span>{route.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex w-full justify-center px-3 py-1 md:justify-start">
          <SidebarThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
