import { cn } from "@/lib/utils"

/** Pulse-trace monogram: a single ECG beat inside a rounded tile. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="9" fill="#0E7C7B" />
      <path
        d="M5 17.5h6l2.2-5 3.6 10 2.6-7.5 1.6 2.5H27"
        fill="none"
        stroke="#F5FBFB"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span className={cn("font-heading text-[1.05rem] font-semibold tracking-tight whitespace-nowrap", className)}>Doctor Tracker</span>
  )
}
