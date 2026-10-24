import { ImageResponse } from "next/og"
import { consultingDays } from "@/components/public/doctor-card"
import { initials } from "@/lib/format"
import { OG_COLORS, OG_SIZE, ogCanvas, ogCopy, ogFonts, OgBrand, OgTrace, OG_BOOK_AT } from "@/lib/og"
import { getPublicDoctor } from "@/lib/server-api"

/** A doctor's own link preview: who they are, where they consult and what a visit costs. */
export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "Doctor profile on Doctor Tracker"

export default async function Image({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { id } = await params
  const { d, f } = await ogCopy()
  const result = await getPublicDoctor(id)
  const fonts = await ogFonts()

  // Unknown doctor or API asleep: fall back to a plain branded card.
  if (result.status !== 200) {
    return new ImageResponse(
      (
        <div style={{ ...ogCanvas, flexDirection: "column", justifyContent: "center", padding: 72, gap: 28 }}>
          <OgTrace />
          <OgBrand size={72} />
          <div style={{ display: "flex", fontSize: 52, fontWeight: 700, letterSpacing: -1 }}>{d.meta.doctorsTitle}</div>
        </div>
      ),
      { ...size, fonts }
    )
  }

  const doctor = result.doctor
  const specialty = d.enums.specialization[doctor.specialization] ?? doctor.specialization
  const { availability } = doctor
  const facts = [
    doctor.hospital,
    `${consultingDays(availability.days, d)}, ${f.wallTime(availability.start)}–${f.wallTime(availability.end)}`,
  ]

  return new ImageResponse(
    (
      <div style={{ ...ogCanvas, flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 72px" }}>
        <OgTrace />
        <OgBrand />

        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 200,
              height: 200,
              borderRadius: 48,
              backgroundColor: OG_COLORS.tealSoft,
              color: OG_COLORS.teal,
              fontSize: 76,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials(doctor.name)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 820 }}>
            <div style={{ display: "flex", fontSize: 62, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5 }}>{doctor.name}</div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: OG_COLORS.teal }}>{specialty}</div>
            {facts.map((fact) => (
              <div key={fact} style={{ display: "flex", fontSize: 26, color: OG_COLORS.muted }}>
                {fact}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            {/* Inter has no ৳ glyph. */}
            <span style={{ fontSize: 44, fontWeight: 700 }}>{`BDT ${f.number(doctor.consultationFee)}`}</span>
            <span style={{ fontSize: 24, color: OG_COLORS.muted }}>{d.common.perVisit}</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "14px 26px",
              borderRadius: 14,
              backgroundColor: OG_COLORS.teal,
              color: "#FFFFFF",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {OG_BOOK_AT}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
