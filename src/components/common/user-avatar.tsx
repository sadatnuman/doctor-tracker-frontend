import { memo } from "react"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  src?: string | null
  className?: string
  tone?: "teal" | "slate" | "sidebar"
}

const TONES = {
  teal: "bg-accent text-accent-foreground",
  slate: "bg-secondary text-secondary-foreground",
  sidebar: "bg-sidebar-primary text-sidebar-primary-foreground",
}

/** Profile picture when there is one, otherwise the person's initials. */
export const UserAvatar = memo(function UserAvatar({ name, src, className, tone = "slate" }: UserAvatarProps) {
  if (src) {
    return (
      // Small, already-resized avatars from our own API: a plain <img> avoids an optimizer round trip.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className={cn("size-9 shrink-0 rounded-full object-cover", className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold", TONES[tone], className)}
    >
      {initials(name)}
    </span>
  )
})
