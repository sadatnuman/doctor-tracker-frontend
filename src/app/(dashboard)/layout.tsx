import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <SiteHeader />
        <div className="mx-auto w-full max-w-[90rem] flex-1 px-4 pt-6 pb-16 md:px-6 lg:px-8 lg:pt-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
