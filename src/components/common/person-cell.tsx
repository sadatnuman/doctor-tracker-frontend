import Link from "next/link"
import { memo } from "react"
import { UserAvatar } from "./user-avatar"

interface PersonCellProps {
  name: string
  secondary?: string
  href?: string
  avatarUrl?: string | null
  tone?: "teal" | "slate"
}

export const PersonCell = memo(function PersonCell({ name, secondary, href, avatarUrl, tone = "slate" }: PersonCellProps) {
  const title = href ? (
    <Link href={href} className="truncate font-medium underline-offset-4 hover:text-primary hover:underline focus-visible:underline">
      {name}
    </Link>
  ) : (
    <span className="truncate font-medium">{name}</span>
  )

  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={name} src={avatarUrl} tone={tone} />
      <div className="grid min-w-0">
        {title}
        {secondary && <span className="truncate text-xs text-muted-foreground">{secondary}</span>}
      </div>
    </div>
  )
})
