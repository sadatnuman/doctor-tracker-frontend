"use client"

import { CalendarCheck, CalendarClock, LayoutDashboard, Stethoscope, Users } from "lucide-react"
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
import { useI18n } from "@/i18n/client"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { UserMenu } from "./user-menu"

export type WorkspaceArea = "admin" | "doctor"

type NavKey = keyof Dictionary["nav"]
/** Each workspace's navigation; paths are relative to the locale. */
const NAV: Record<WorkspaceArea, { path: string; label: NavKey; icon: typeof LayoutDashboard }[]> = {
  admin: [
    { path: "/admin", label: "dashboard", icon: LayoutDashboard },
    { path: "/admin/doctors", label: "doctors", icon: Stethoscope },
    { path: "/admin/patients", label: "patients", icon: Users },
    { path: "/admin/appointments", label: "appointments", icon: CalendarCheck },
  ],
  doctor: [
    { path: "/doctor", label: "overview", icon: LayoutDashboard },
    { path: "/doctor/appointments", label: "appointments", icon: CalendarCheck },
    { path: "/doctor/patients", label: "myPatients", icon: Users },
    { path: "/doctor/schedule", label: "schedule", icon: CalendarClock },
  ],
}

/** "/bn/admin" is active only on itself; "/bn/admin/doctors" also on its children. */
function isActive(pathname: string, href: string, isHome: boolean) {
  return isHome ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

function NavLinks({ area, pathname }: { area: WorkspaceArea; pathname: string | null }) {
  const { setOpenMobile } = useSidebar()
  const { d, href } = useI18n()
  return (
    <SidebarMenu className="gap-1">
      {NAV[area].map(({ path, label, icon: Icon }, i) => {
        const target = href(path)
        const active = pathname !== null && isActive(pathname, target, i === 0)
        return (
          <SidebarMenuItem key={path}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={d.nav[label]}
              size="lg"
              className="h-10 text-[0.9rem] data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]"
            >
              <Link href={target} aria-current={active ? "page" : undefined} onClick={() => setOpenMobile(false)}>
                <Icon className={active ? "text-sidebar-primary" : undefined} />
                <span>{d.nav[label]}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

/** The pathname is request data, so the active state streams in under Suspense. */
function ActiveNavLinks({ area }: { area: WorkspaceArea }) {
  return <NavLinks area={area} pathname={usePathname()} />
}

export function AppSidebar({ area }: { area: WorkspaceArea }) {
  const { setOpenMobile } = useSidebar()
  const { href, d } = useI18n()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-4 pb-3">
        <Link href={href("/")} className="flex items-center gap-2.5 text-white" onClick={() => setOpenMobile(false)}>
          <BrandMark className="size-8" />
          <BrandName className="group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label={d.nav.mainNav}>
              <Suspense fallback={<NavLinks area={area} pathname={null} />}>
                <ActiveNavLinks area={area} />
              </Suspense>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <UserMenu profileHref={href(`/${area}/profile`)} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
