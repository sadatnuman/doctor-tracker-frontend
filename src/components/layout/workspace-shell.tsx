"use client"

import { RoleGate } from "@/components/common/role-gate"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar, type WorkspaceArea } from "./app-sidebar"
import { SiteHeader } from "./site-header"

/** Sidebar layout shared by the admin and doctor workspaces, gated to the area's role. */
export function WorkspaceShell({ area, children }: { area: WorkspaceArea; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar area={area} />
      <SidebarInset className="min-w-0 bg-background">
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-[90rem] flex-1 px-4 pt-6 pb-16 md:px-6 lg:px-8 lg:pt-8">
          <RoleGate role={area}>{children}</RoleGate>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
