import { ImageResponse } from "next/og"
import { LOCALES } from "@/i18n/config"
import { OG_COLORS, OG_SIZE, ogCanvas, ogCopy, ogFonts, OgBrand, OgTrace, OG_BOOK_AT } from "@/lib/og"

/** The link preview for the site: shown when any page is shared, unless a page has its own. */
export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "Doctor Tracker: book a doctor appointment online in Bangladesh"

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

const SLOTS = [
  { time: "09:30", state: "taken" },
  { time: "10:00", state: "open" },
  { time: "10:30", state: "open" },
  { time: "11:00", state: "picked" },
  { time: "11:30", state: "taken" },
  { time: "12:00", state: "open" },
] as const

export default async function Image() {
  const { d, f } = await ogCopy()

  return new ImageResponse(
    (
      <div style={ogCanvas}>
        <OgTrace />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 660, padding: "64px 0 72px 72px" }}>
          <OgBrand />
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 58, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.5 }}>
              {d.landing.heroTitle}
            </div>
            <div style={{ display: "flex", fontSize: 26, lineHeight: 1.4, color: OG_COLORS.muted }}>Live slots from doctors across Bangladesh. Pay by card, bKash or Nagad.</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: OG_COLORS.teal }}>
            {OG_BOOK_AT}
          </div>
        </div>

        {/* A booking ticket: the product in one glance. */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", paddingRight: 56 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 400,
              padding: 32,
              gap: 24,
              borderRadius: 28,
              backgroundColor: OG_COLORS.card,
              border: `1px solid ${OG_COLORS.line}`,
              boxShadow: "0 24px 60px rgba(15, 42, 61, 0.14)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  backgroundColor: OG_COLORS.tealSoft,
                  color: OG_COLORS.teal,
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                AR
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 700 }}>Dr. Ayesha Rahman</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: OG_COLORS.teal }}>{d.enums.specialization["General Medicine"]}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {SLOTS.map((s) => (
                <div
                  key={s.time}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: 102,
                    padding: "12px 0",
                    borderRadius: 12,
                    fontSize: 20,
                    fontWeight: 600,
                    border: `1px ${s.state === "taken" ? "dashed" : "solid"} ${s.state === "picked" ? OG_COLORS.teal : OG_COLORS.line}`,
                    backgroundColor: s.state === "picked" ? OG_COLORS.teal : OG_COLORS.card,
                    color: s.state === "picked" ? "#FFFFFF" : s.state === "taken" ? "#9AA9B5" : OG_COLORS.ink,
                    textDecoration: s.state === "taken" ? "line-through" : "none",
                  }}
                >
                  {f.wallTime(s.time)}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: 14,
                backgroundColor: "#F8EEDC",
                border: "1px solid #E9D2A6",
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 600, color: "#7A5214" }}>Held for you</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: OG_COLORS.pending }}>4:59</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() }
  )
}
