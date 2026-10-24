"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic"
import { useQueryStates } from "nuqs"
import { ErrorState } from "@/components/common/states"
import { StatusBand } from "@/components/common/status-band"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useOverview } from "@/hooks/use-overview"
import { useI18n } from "@/i18n/client"
import { dashboardParams, RANGE_PRESETS, type RangePreset } from "@/lib/search-params"
import type { Overview, PatientStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChartPanel } from "./chart-panel"

// Recharts (~100 kB) is split out and only loaded on the dashboard.
const chartFallback = () => <Skeleton className="h-[220px] w-full rounded-lg" />
const AdmissionsTrace = dynamic(() => import("./charts").then((m) => m.AdmissionsTrace), { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-lg" /> })
const PatientsPerDoctorChart = dynamic(() => import("./charts").then((m) => m.PatientsPerDoctorChart), { ssr: false, loading: chartFallback })
const RankedBars = dynamic(() => import("./charts").then((m) => m.RankedBars), { ssr: false, loading: chartFallback })
const AgeColumns = dynamic(() => import("./charts").then((m) => m.AgeColumns), { ssr: false, loading: chartFallback })

export function DashboardView() {
  const { d, tr } = useI18n()
  const t = d.dashboard
  const [{ range }, setParams] = useQueryStates(dashboardParams, { history: "replace" })
  const { data, error, isPending, isPlaceholderData, refetch } = useOverview(range)
  const condition = (c: string) => d.enums.condition[c as keyof typeof d.enums.condition] ?? c
  const specialty = (s: string) => d.enums.specialization[s] ?? s

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-semibold sm:text-[2rem]">{d.admin.dashboardTitle}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{tr(d.admin.dashboardBody, { range: t.rangeLong[range] })}</p>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={range}
          onValueChange={(v) => v && setParams({ range: v as RangePreset })}
          aria-label={t.dateRange}
          className="w-full bg-card sm:w-auto"
        >
          {RANGE_PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset}
              value={preset}
              className="flex-1 px-3 data-[state=on]:bg-accent data-[state=on]:font-semibold data-[state=on]:text-accent-foreground sm:flex-none"
            >
              {t.ranges[preset]}
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
              title={t.perDoctorTitle}
              description={tr(t.perDoctorBody, { range: t.rangeLong[range] })}
              table={{ columns: [d.appointment.doctor, t.patientsLabel], rows: data.patientsPerDoctor.map((p) => [p.name, p.count]) }}
            >
              {data.patientsPerDoctor.length ? <PatientsPerDoctorChart data={data.patientsPerDoctor} /> : <NoData />}
            </ChartPanel>

            <ChartPanel
              className="lg:col-span-2"
              title={t.conditionsTitle}
              description={t.conditionsBody}
              table={{ columns: [d.patientsAdmin.condition, t.patientsLabel], rows: data.byCondition.map((c) => [condition(c.condition), c.count]) }}
            >
              {data.byCondition.length ? (
                <RankedBars data={data.byCondition.map((c) => ({ label: condition(c.condition), count: c.count }))} valueLabel={t.patientsLabel} />
              ) : (
                <NoData />
              )}
            </ChartPanel>
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <StatusPanel data={data} className="lg:col-span-2" />
            <ChartPanel
              className="lg:col-span-3"
              title={t.ageTitle}
              description={t.ageBody}
              table={{ columns: [t.ageTitle, t.patientsLabel], rows: data.byAgeGroup.map((a) => [a.group, a.count]) }}
              aside={<GenderSplit data={data.byGender} />}
            >
              {data.totals.patientsInRange ? <AgeColumns data={data.byAgeGroup} /> : <NoData />}
            </ChartPanel>
          </div>

          <ChartPanel
            title={t.specialtyTitle}
            description={t.specialtyBody}
            table={{ columns: [d.doctorsAdmin.specialization, t.doctorsLabel], rows: data.doctorsBySpecialization.map((s) => [specialty(s.specialization), s.count]) }}
          >
            <RankedBars data={data.doctorsBySpecialization.map((s) => ({ label: specialty(s.specialization), count: s.count }))} valueLabel={t.doctorsLabel} />
          </ChartPanel>
        </div>
      )}
    </>
  )
}

/** Headline figures in one divided strip rather than a row of identical cards. */
function StatStrip({ data }: { data: Overview }) {
  const { d, tr, f } = useI18n()
  const t = d.dashboard
  const { totals } = data
  const criticalShare = totals.patientsInRange ? Math.round((totals.criticalInRange / totals.patientsInRange) * 100) : 0
  const stats = [
    { label: t.doctors, value: f.number(totals.doctors), note: tr(t.joinedInRange, { count: f.number(totals.newDoctorsInRange) }) },
    { label: t.patients, value: f.number(totals.patients), note: t.acrossDoctors },
    { label: t.avgCaseload, value: f.number(totals.avgPatientsPerDoctor), note: t.perDoctor },
    { label: t.bookings, value: f.number(totals.bookingsInRange), note: tr(t.revenue, { amount: f.money(totals.revenueInRange) }) },
    { label: t.critical, value: f.number(totals.criticalInRange), note: tr(t.criticalShare, { pct: f.number(criticalShare) }), critical: true },
  ]
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-5">
      {stats.map((s, i) => (
        <div key={s.label} className={cn("bg-card px-5 py-4 sm:py-5", i === stats.length - 1 && "col-span-2 sm:col-span-1")}>
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
  const { d, tr, f } = useI18n()
  const t = d.dashboard
  const { totals, range: r } = data
  const change = totals.patientsChangePct
  const up = (change ?? 0) >= 0
  const peak = data.patientsOverTime.reduce((best, p) => (p.count > best.count ? p : best), { date: "", count: -1 })

  return (
    <section className="overflow-hidden rounded-xl border bg-card" aria-label={t.admissions}>
      <div className="flex flex-col gap-4 px-5 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">{t.admissions}</h2>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-heading text-[2.6rem] leading-none font-semibold tabular">{f.number(totals.patientsInRange)}</span>
            {change !== null && range !== "all" && (
              <span className={cn("inline-flex items-center gap-1 text-sm font-medium", up ? "text-recovered" : "text-critical")}>
                {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {tr(t.vsPrevious, { change: `${up ? "+" : ""}${f.number(change)}`, previous: t.rangePrevious[range] })}
              </span>
            )}
          </p>
        </div>
        {peak.count > 0 && (
          <p className="text-sm text-muted-foreground">
            {tr(t.busiest, { interval: t.intervals[r.interval], when: f.bucket(peak.date, r.interval, true), count: f.number(peak.count) })}
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
  const { d, tr, f } = useI18n()
  const t = d.dashboard
  const counts = Object.fromEntries(data.byStatus.map((s) => [s.status, s.count])) as Partial<Record<PatientStatus, number>>
  return (
    <ChartPanel
      className={className}
      title={t.statusTitle}
      description={t.statusBody}
      table={{ columns: [d.patientsAdmin.status, t.patientsLabel], rows: data.byStatus.map((s) => [d.enums.status[s.status], s.count]) }}
    >
      {data.totals.patientsInRange ? (
        <div className="flex h-full flex-col justify-center gap-6 py-4">
          <StatusBand counts={counts} size="lg" />
          <p className="text-sm text-muted-foreground">
            {tr(t.statusSummary, {
              done: f.number((counts.Recovered ?? 0) + (counts.Discharged ?? 0)),
              total: f.number(data.totals.patientsInRange),
            })}
          </p>
        </div>
      ) : (
        <NoData />
      )}
    </ChartPanel>
  )
}

function GenderSplit({ data }: { data: Overview["byGender"] }) {
  const { d, f } = useI18n()
  const total = data.reduce((s, g) => s + g.count, 0)
  if (!total) return null
  return (
    <p className="hidden text-xs text-muted-foreground md:block">
      {data.map((g, i) => (
        <span key={g.gender}>
          {i > 0 && ", "}
          {d.enums.gender[g.gender]} <span className="font-medium text-foreground tabular">{f.number(Math.round((g.count / total) * 100))}%</span>
        </span>
      ))}
    </p>
  )
}

function NoData() {
  const { d } = useI18n()
  return <p className="py-12 text-center text-sm text-muted-foreground">{d.dashboard.noData}</p>
}

function DashboardSkeleton() {
  const { d } = useI18n()
  return (
    <div className="grid gap-5" aria-busy="true" aria-label={d.common.loading}>
      <Skeleton className="h-[116px] rounded-xl" />
      <Skeleton className="h-[400px] rounded-xl" />
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
    </div>
  )
}
