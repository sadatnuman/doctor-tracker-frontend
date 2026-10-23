"use client"

import { LayoutDashboard, Stethoscope, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { BrandMark, BrandName } from "@/components/brand-mark"
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserMenu } from "./user-menu"

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
] as const

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

/** The pathname is request data, so the active state streams in under Suspense. */
function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />
}

function NavLinks({ pathname }: { pathname: string | null }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu className="gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname !== null && isActivePath(pathname, href)
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={label}
              size="lg"
              className="h-10 text-[0.9rem] data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]"
            >
              <Link href={href} aria-current={active ? "page" : undefined} onClick={() => setOpenMobile(false)}>
                <Icon className={active ? "text-sidebar-primary" : undefined} />
                <span>{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-4 pb-3">
        <Link href="/" className="flex items-center gap-2.5 text-white" onClick={() => setOpenMobile(false)}>
          <BrandMark className="size-8" />
          <BrandName className="group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Suspense fallback={<NavLinks pathname={null} />}>
              <ActiveNavLinks />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
