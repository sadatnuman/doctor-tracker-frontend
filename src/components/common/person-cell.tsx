import Link from "next/link"
import { memo } from "react"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PersonCellProps {
  name: string
  secondary?: string
  href?: string
  tone?: "teal" | "slate"
}

export const PersonCell = memo(function PersonCell({ name, secondary, href, tone = "slate" }: PersonCellProps) {
  const title = href ? (
    <Link href={href} className="truncate font-medium hover:text-primary hover:underline focus-visible:underline underline-offset-4">
      {name}
    </Link>
  ) : (
    <span className="truncate font-medium">{name}</span>
  )

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold",
          tone === "teal" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {initials(name)}
      </span>
      <div className="grid min-w-0">
        {title}
        {secondary && <span className="truncate text-xs text-muted-foreground">{secondary}</span>}
      </div>
    </div>
  )
})
