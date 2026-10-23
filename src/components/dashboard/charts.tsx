"use client"

/**
 * All Recharts code lives here so the dashboard can lazy-load it (next/dynamic):
 * the charting library never lands in the Doctors/Patients bundles.
 *
 * Colour rules: every magnitude chart uses the single teal hue; status uses the
 * reserved triage palette, always beside a text label.
 */

import { useRouter } from "next/navigation"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { formatBucket, formatCompact, formatNumber } from "@/lib/format"
import type { Interval, Overview } from "@/lib/types"

const tick = { fill: "var(--muted-foreground)", fontSize: 12 }

const admissionsConfig = { count: { label: "Admissions", color: "var(--chart-1)" } } satisfies ChartConfig

export function AdmissionsTrace({ data, interval }: { data: Overview["patientsOverTime"]; interval: Interval }) {
  const many = data.length > 16
  return (
    <ChartContainer config={admissionsConfig} className="trace-line aspect-auto h-[260px] w-full sm:h-[300px]">
      <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -12 }} accessibilityLayer>
        <defs>
          <linearGradient id="trace-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-count)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={tick}
          tickMargin={10}
          minTickGap={many ? 28 : 12}
          tickFormatter={(v: string) => formatBucket(v, interval)}
        />
        <YAxis tickLine={false} axisLine={false} tick={tick} width={44} allowDecimals={false} tickFormatter={(v: number) => formatCompact(v)} />
        <ChartTooltip
          cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.25, strokeDasharray: "3 3" }}
          content={<ChartTooltipContent labelFormatter={(_, payload) => formatBucket(String(payload?.[0]?.payload?.date ?? ""), interval, true)} />}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          strokeWidth={2}
          fill="url(#trace-fill)"
          isAnimationActive={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

const barConfig = { count: { label: "Patients", color: "var(--chart-1)" } } satisfies ChartConfig

/** Top doctors by caseload. Bars link to the doctor's page. */
export function PatientsPerDoctorChart({ data }: { data: Overview["patientsPerDoctor"] }) {
  const router = useRouter()
  const animate = !usePrefersReducedMotion()
  const rows = data.map((d) => ({ ...d, label: d.name.replace(/^Dr\.\s*/, "Dr. ") }))
  return (
    <ChartContainer config={barConfig} className="aspect-auto w-full" style={{ height: Math.max(220, rows.length * 34) }}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={6} accessibilityLayer>
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tick={tick} width={176} />
        <XAxis type="number" hide />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as (typeof rows)[number] | undefined
                return p ? `${p.name}, ${p.specialization}` : ""
              }}
              formatter={(value, _name, item) => (
                <div className="grid gap-0.5">
                  <span><span className="font-semibold tabular">{formatNumber(Number(value))}</span> patients</span>
                  <span className="text-muted-foreground">{item.payload.critical} critical</span>
                </div>
              )}
            />
          }
        />
        <Bar
          isAnimationActive={animate}
          dataKey="count"
          fill="var(--color-count)"
          radius={[0, 4, 4, 0]}
          className="cursor-pointer"
          onClick={(entry) => router.push(`/doctors/${(entry as unknown as { doctorId: string }).doctorId}`)}
        >
          <LabelList dataKey="count" position="right" className="fill-foreground tabular" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/** Generic ranked horizontal bars (conditions, specializations). */
export function RankedBars({ data, valueLabel }: { data: { label: string; count: number }[]; valueLabel: string }) {
  const config = { count: { label: valueLabel, color: "var(--chart-1)" } } satisfies ChartConfig
  const animate = !usePrefersReducedMotion()
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(180, data.length * 30) }}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={5} accessibilityLayer>
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tick={tick} width={132} />
        <XAxis type="number" hide />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltipContent hideIndicator />} />
        <Bar isAnimationActive={animate} dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]}>
          <LabelList dataKey="count" position="right" className="fill-foreground tabular" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function AgeColumns({ data }: { data: Overview["byAgeGroup"] }) {
  const animate = !usePrefersReducedMotion()
  return (
    <ChartContainer config={barConfig} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 0, bottom: 0, left: 0 }} barCategoryGap="28%" accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey="group" tickLine={false} axisLine={false} tick={tick} tickMargin={8} />
        <YAxis hide />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltipContent hideIndicator labelFormatter={(l) => `Age ${l}`} />} />
        <Bar isAnimationActive={animate} dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="count" position="top" className="fill-muted-foreground tabular" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
