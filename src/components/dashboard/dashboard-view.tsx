"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic"
import { useQueryStates } from "nuqs"
import { ErrorState } from "@/components/common/states"
import { StatusBand } from "@/components/common/status-band"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useOverview } from "@/hooks/use-overview"
import { formatBucket, formatNumber } from "@/lib/format"
import { dashboardParams, type RangePreset } from "@/lib/search-params"
import type { Overview, PatientStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChartPanel } from "./chart-panel"

// Recharts (~100 kB) is split out and only loaded on the dashboard.
const chartFallback = () => <Skeleton className="h-[220px] w-full rounded-lg" />
const AdmissionsTrace = dynamic(() => import("./charts").then((m) => m.AdmissionsTrace), { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-lg" /> })
const PatientsPerDoctorChart = dynamic(() => import("./charts").then((m) => m.PatientsPerDoctorChart), { ssr: false, loading: chartFallback })
const RankedBars = dynamic(() => import("./charts").then((m) => m.RankedBars), { ssr: false, loading: chartFallback })
const AgeColumns = dynamic(() => import("./charts").then((m) => m.AgeColumns), { ssr: false, loading: chartFallback })

const RANGE_LABELS: Record<RangePreset, { short: string; long: string; previous: string }> = {
  "7d": { short: "7 days", long: "the last 7 days", previous: "previous 7 days" },
  "30d": { short: "30 days", long: "the last 30 days", previous: "previous 30 days" },
  "90d": { short: "90 days", long: "the last 90 days", previous: "previous 90 days" },
  "12m": { short: "12 months", long: "the last 12 months", previous: "previous 12 months" },
  all: { short: "All time", long: "all time", previous: "" },
}

export function DashboardView() {
  const [{ range }, setParams] = useQueryStates(dashboardParams, { history: "replace" })
  const { data, error, isPending, isPlaceholderData, refetch } = useOverview(range)
  const label = RANGE_LABELS[range]

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-semibold sm:text-[2rem]">Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Roster size, caseloads and admissions for {label.long}.</p>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={range}
          onValueChange={(v) => v && setParams({ range: v as RangePreset })}
          aria-label="Date range"
          className="w-full bg-card sm:w-auto"
        >
          {(Object.keys(RANGE_LABELS) as RangePreset[]).map((preset) => (
            <ToggleGroupItem key={preset} value={preset} className="flex-1 px-3 data-[state=on]:bg-accent data-[state=on]:font-semibold data-[state=on]:text-accent-foreground sm:flex-none">
              {RANGE_LABELS[preset].short}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isPending ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="rounded-xl border bg-card">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      ) : (
        <div className={cn("grid gap-5 transition-opacity", isPlaceholderData && "opacity-60")}>
          <StatStrip data={data} />
          <AdmissionsPanel data={data} range={range} />

          <div className="grid gap-5 lg:grid-cols-5">
            <ChartPanel
              className="lg:col-span-3"
              title="Patients per doctor"
              description={`The ten largest caseloads by admissions in ${label.long}. Select a bar to open the doctor.`}
              table={{ columns: ["Doctor", "Patients"], rows: data.patientsPerDoctor.map((d) => [d.name, d.count]) }}
            >
              {data.patientsPerDoctor.length ? <PatientsPerDoctorChart data={data.patientsPerDoctor} /> : <NoData />}
            </ChartPanel>

            <ChartPanel
              className="lg:col-span-2"
              title="Conditions"
              description="What patients were admitted with."
              table={{ columns: ["Condition", "Patients"], rows: data.byCondition.map((c) => [c.condition, c.count]) }}
            >
              {data.byCondition.length ? <RankedBars data={data.byCondition.map((c) => ({ label: c.condition, count: c.count }))} valueLabel="Patients" /> : <NoData />}
            </ChartPanel>
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <StatusPanel data={data} className="lg:col-span-2" />
            <ChartPanel
              className="lg:col-span-3"
              title="Age groups"
              description="Patients admitted in range, by age at admission."
              table={{ columns: ["Age group", "Patients"], rows: data.byAgeGroup.map((a) => [a.group, a.count]) }}
              aside={<GenderSplit data={data.byGender} />}
            >
              {data.totals.patientsInRange ? <AgeColumns data={data.byAgeGroup} /> : <NoData />}
            </ChartPanel>
          </div>

          <ChartPanel
            title="Doctors by specialization"
            description="The whole roster, regardless of date range."
            table={{ columns: ["Specialization", "Doctors"], rows: data.doctorsBySpecialization.map((s) => [s.specialization, s.count]) }}
          >
            <RankedBars data={data.doctorsBySpecialization.map((s) => ({ label: s.specialization, count: s.count }))} valueLabel="Doctors" />
          </ChartPanel>
        </div>
      )}
    </>
  )
}

/** Headline figures in one divided strip rather than a row of identical cards. */
function StatStrip({ data }: { data: Overview }) {
  const { totals } = data
  const criticalShare = totals.patientsInRange ? Math.round((totals.criticalInRange / totals.patientsInRange) * 100) : 0
  const stats = [
    { label: "Doctors", value: formatNumber(totals.doctors), note: `${formatNumber(totals.newDoctorsInRange)} joined in range` },
    { label: "Patients", value: formatNumber(totals.patients), note: "across every doctor" },
    { label: "Average caseload", value: totals.avgPatientsPerDoctor.toLocaleString("en-US"), note: "patients per doctor" },
    { label: "Critical", value: formatNumber(totals.criticalInRange), note: `${criticalShare}% of admissions in range`, critical: true },
  ]
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={s.label} className={cn("px-5 py-4 sm:py-5", i % 2 === 1 && "border-l", i >= 2 && "border-t lg:border-t-0", i === 2 && "lg:border-l")}>
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            {s.critical && <span aria-hidden className="size-2 rounded-full bg-critical" />}
            {s.label}
          </dt>
          <dd className="mt-1 font-heading text-[1.75rem] leading-none font-semibold tabular sm:text-[2rem]">{s.value}</dd>
          <dd className="mt-2 text-xs text-muted-foreground">{s.note}</dd>
        </div>
      ))}
    </dl>
  )
}

/** The page's one bold element: admissions drawn as a monitor trace on chart paper. */
function AdmissionsPanel({ data, range }: { data: Overview; range: RangePreset }) {
  const { totals, range: r } = data
  const change = totals.patientsChangePct
  const up = (change ?? 0) >= 0
  const peak = data.patientsOverTime.reduce((best, p) => (p.count > best.count ? p : best), { date: "", count: -1 })

  return (
    <section className="overflow-hidden rounded-xl border bg-card" aria-label="Admissions over time">
      <div className="flex flex-col gap-4 px-5 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Admissions</h2>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-heading text-[2.6rem] leading-none font-semibold tabular">{formatNumber(totals.patientsInRange)}</span>
            {change !== null && range !== "all" && (
              <span className={cn("inline-flex items-center gap-1 text-sm font-medium", up ? "text-recovered" : "text-critical")}>
                {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {up ? "+" : ""}
                {change}% vs {RANGE_LABELS[range].previous}
              </span>
            )}
          </p>
        </div>
        {peak.count > 0 && (
          <p className="text-sm text-muted-foreground">
            Busiest {r.interval}: <span className="font-medium text-foreground">{formatBucket(peak.date, r.interval, true)}</span>, {formatNumber(peak.count)} admissions
          </p>
        )}
      </div>
      <div className="chart-paper mx-5 mt-4 mb-5 rounded-lg border px-1 pt-2">
        <AdmissionsTrace data={data.patientsOverTime} interval={r.interval} />
      </div>
    </section>
  )
}

function StatusPanel({ data, className }: { data: Overview; className?: string }) {
  const counts = Object.fromEntries(data.byStatus.map((s) => [s.status, s.count])) as Partial<Record<PatientStatus, number>>
  return (
    <ChartPanel
      className={className}
      title="Patient status"
      description="Where admissions in range stand today."
      table={{ columns: ["Status", "Patients"], rows: data.byStatus.map((s) => [s.status, s.count]) }}
    >
      {data.totals.patientsInRange ? (
        <div className="flex h-full flex-col justify-center gap-6 py-4">
          <StatusBand counts={counts} size="lg" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular">{formatNumber((counts.Recovered ?? 0) + (counts.Discharged ?? 0))}</span> of{" "}
            {formatNumber(data.totals.patientsInRange)} patients have recovered or been discharged.
          </p>
        </div>
      ) : (
        <NoData />
      )}
    </ChartPanel>
  )
}

function GenderSplit({ data }: { data: Overview["byGender"] }) {
  const total = data.reduce((s, g) => s + g.count, 0)
  if (!total) return null
  return (
    <p className="hidden text-xs text-muted-foreground md:block">
      {data.map((g, i) => (
        <span key={g.gender}>
          {i > 0 && ", "}
          {g.gender} <span className="font-medium text-foreground tabular">{Math.round((g.count / total) * 100)}%</span>
        </span>
      ))}
    </p>
  )
}

function NoData() {
  return <p className="py-12 text-center text-sm text-muted-foreground">No admissions in this range.</p>
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-[116px] rounded-xl" />
      <Skeleton className="h-[400px] rounded-xl" />
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
    </div>
  )
}
