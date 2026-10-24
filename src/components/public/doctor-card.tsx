import { Building2, CalendarDays } from "lucide-react"
import Link from "next/link"
import { UserAvatar } from "@/components/common/user-avatar"
import { localePath, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { createFormatters, interpolate } from "@/lib/format"
import type { PublicDoctor } from "@/lib/types"

/** Bangladesh week order for listing consulting days. */
const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5]

export function consultingDays(days: number[], d: Dictionary) {
  return WEEK_ORDER.filter((day) => days.includes(day))
    .map((day) => d.enums.weekdaysShort[day])
    .join(", ")
}

/** Server-rendered directory card: the whole card is one link to the profile. */
export function DoctorCard({ doctor, locale, d, headingLevel = 3 }: { doctor: PublicDoctor; locale: Locale; d: Dictionary; headingLevel?: 2 | 3 }) {
  const f = createFormatters(locale)
  const Heading = `h${headingLevel}` as const
  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start gap-3.5">
        <UserAvatar name={doctor.name} src={doctor.avatarUrl} tone="teal" className="size-12 text-sm" />
        <div className="min-w-0">
          <Heading className="text-base leading-snug font-semibold">
            <Link href={localePath(locale, `/doctors/${doctor.id}`)} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none group-focus-within:underline">
              {doctor.name}
            </Link>
          </Heading>
          <p className="text-sm font-medium text-primary">{d.enums.specialization[doctor.specialization] ?? doctor.specialization}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Building2 className="size-4 shrink-0" />
          <span className="truncate">{doctor.hospital}</span>
        </li>
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">{interpolate(d.directory.available, { days: consultingDays(doctor.availability.days, d) })}</span>
        </li>
      </ul>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <p className="text-xs text-muted-foreground">{d.directory.consultationFee}</p>
          <p className="font-heading text-lg font-semibold tabular">{f.money(doctor.consultationFee)}</p>
        </div>
        <span className="text-sm font-medium text-primary">{d.directory.viewProfile}</span>
      </div>
    </article>
  )
}
