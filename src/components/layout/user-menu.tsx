"use client"

import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogout, useMe } from "@/hooks/use-auth"
import { initials } from "@/lib/format"

export function UserMenu() {
  const { data: user, isPending } = useMe()
  const logout = useLogout()
  const { isMobile } = useSidebar()
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="h-12 data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                  {user ? initials(user.name) : ""}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {isPending ? (
                  <>
                    <Skeleton className="h-3.5 w-20 bg-sidebar-accent" />
                    <Skeleton className="mt-1 h-3 w-28 bg-sidebar-accent" />
                  </>
                ) : (
                  <>
                    <span className="truncate font-medium text-white">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="min-w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setTheme(dark ? "light" : "dark")}>
              {dark ? <Sun /> : <Moon />}
              {dark ? "Light theme" : "Dark theme"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" disabled={logout.isPending} onSelect={() => logout.mutate()}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
