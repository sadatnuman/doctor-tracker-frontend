import type { Metadata } from "next"
import { WorkspaceShell } from "@/components/layout/workspace-shell"

// Private area: never indexed (also disallowed in robots.txt).
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return <WorkspaceShell area="admin">{children}</WorkspaceShell>
}
