"use client"

import { BarChart3, Table2 } from "lucide-react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"

export interface TableView {
  columns: [string, string]
  rows: [string, string | number][]
}

interface ChartPanelProps {
  title: string
  description?: string
  table: TableView
  className?: string
  bodyClassName?: string
  aside?: React.ReactNode
  children: React.ReactNode
}

/** Chart frame with a "Table" view: identity and values never rely on colour alone. */
export function ChartPanel({ title, description, table, className, bodyClassName, aside, children }: ChartPanelProps) {
  const { d, tr } = useI18n()
  const [view, setView] = useState<"chart" | "table">("chart")

  return (
    <section className={cn("flex min-w-0 flex-col rounded-xl border bg-card", className)} aria-label={title}>
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {aside}
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={view}
            onValueChange={(v) => v && setView(v as "chart" | "table")}
            aria-label={tr(d.common.viewOf, { title })}
          >
            <ToggleGroupItem value="chart" aria-label={d.common.chartView}><BarChart3 /></ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label={d.common.tableView}><Table2 /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>
      <div className={cn("flex-1 px-5 pt-4 pb-5", bodyClassName)}>
        {view === "chart" ? (
          children
        ) : (
          <div className="max-h-80 overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{table.columns[0]}</TableHead>
                  <TableHead className="text-right">{table.columns[1]}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.rows.map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    <TableCell className="text-right tabular">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  )
}
