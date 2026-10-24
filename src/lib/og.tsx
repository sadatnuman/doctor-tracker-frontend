import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { getDictionary } from "@/i18n/server"
import { createFormatters } from "./format"
import { SITE_URL } from "./site"

/**
 * Link-preview images (LinkedIn, Facebook, WhatsApp, X) at the 1.91:1 large-card size.
 * They are always drawn in English: the image renderer can't shape Bengali script (vowel
 * signs land in the wrong place), while the preview's title and description stay localized.
 */
export const OG_SIZE = { width: 1200, height: 630 }

export const OG_COLORS = {
  ink: "#0F2A3D",
  teal: "#0E7C7B",
  tealSoft: "#DCEFEE",
  paper: "#F5F8F9",
  line: "#DAE2E7",
  muted: "#52677A",
  pending: "#B7791F",
  card: "#FFFFFF",
}

const FONT_DIR = join(process.cwd(), "assets", "fonts")
const FONT_FILES = [
  { name: "Inter", file: "inter-latin-400-normal.woff", weight: 400 },
  { name: "Inter", file: "inter-latin-600-normal.woff", weight: 600 },
  { name: "Inter", file: "inter-latin-700-normal.woff", weight: 700 },
] as const

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[]> | null = null

export function ogFonts() {
  fonts ??= Promise.all(
    FONT_FILES.map(async (f) => ({ name: f.name, data: await readFile(join(FONT_DIR, f.file)), weight: f.weight, style: "normal" as const }))
  )
  return fonts
}

export const siteHost = new URL(SITE_URL).host
export const OG_BOOK_AT = `Book online at ${siteHost}`

/** English strings and formatters for the images. */
export async function ogCopy() {
  return { d: await getDictionary("en"), f: createFormatters("en") }
}

/** The pulse-trace monogram, sized for the image. */
export function OgBrand({ size = 56 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <rect width="32" height="32" rx="9" fill={OG_COLORS.teal} />
        <path d="M5 17.5h6l2.2-5 3.6 10 2.6-7.5 1.6 2.5H27" fill="none" stroke="#F5FBFB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: size * 0.56, fontWeight: 600, color: OG_COLORS.ink, letterSpacing: -0.5 }}>Doctor Tracker</span>
    </div>
  )
}

/** A long ECG beat across the bottom edge, echoing the dashboard's admissions trace. */
export function OgTrace() {
  return (
    <svg width="1200" height="120" viewBox="0 0 1200 120" style={{ position: "absolute", left: 0, bottom: 0 }}>
      <path
        d="M0 84H330l22-34 30 68 28-104 24 92 18-22H760l22-34 30 68 28-104 24 92 18-22H1200"
        fill="none"
        stroke={OG_COLORS.teal}
        strokeOpacity="0.22"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Paper canvas with a faint chart-paper grid. */
export const ogCanvas = {
  width: "100%",
  height: "100%",
  display: "flex",
  position: "relative" as const,
  backgroundColor: OG_COLORS.paper,
  backgroundImage: `linear-gradient(${OG_COLORS.line}66 1px, transparent 1px), linear-gradient(90deg, ${OG_COLORS.line}66 1px, transparent 1px)`,
  backgroundSize: "40px 40px",
  fontFamily: "Inter",
  color: OG_COLORS.ink,
}
