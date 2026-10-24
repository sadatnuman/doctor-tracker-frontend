"use client"

import { KeyRound, Plus, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useQueryStates } from "nuqs"
import { memo, useCallback, useMemo, useState } from "react"
import { PageHeader } from "@/components/common/page-header"
import { PersonCell } from "@/components/common/person-cell"
import { EmptyState, ErrorState } from "@/components/common/states"
import { DateRangeFilter } from "@/components/data/date-range-filter"
import { FilterBar } from "@/components/data/filter-bar"
import { FilterSelect } from "@/components/data/filter-select"
import { Pagination } from "@/components/data/pagination"
import { SearchInput } from "@/components/data/search-input"
import { SortSelect } from "@/components/data/sort-select"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDoctors, useFilterOptions } from "@/hooks/use-doctors"
import { useIsMobile } from "@/hooks/use-mobile"
import { useI18n } from "@/i18n/client"
import { toDateParam } from "@/lib/format"
import { doctorListParams, DOCTOR_SORTS } from "@/lib/search-params"
import type { Doctor } from "@/lib/types"
import { cn } from "@/lib/utils"
import { DeleteDoctorDialog } from "./delete-doctor-dialog"
import { DoctorFormDialog } from "./doctor-form-dialog"
import { DoctorRowActions } from "./doctor-row-actions"

export function DoctorsView() {
  const { d } = useI18n()
  const t = d.doctorsAdmin
  const [query, setQuery] = useQueryStates(doctorListParams, { history: "replace" })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | undefined>()
  const [deleting, setDeleting] = useState<Doctor | null>(null)
  const isMobile = useIsMobile()
  const { data: options } = useFilterOptions()
  const sortOptions = DOCTOR_SORTS.map((value) => ({ value, label: t.sort[value] }))
  const specialty = useCallback((s: string) => d.enums.specialization[s] ?? s, [d])

  const params = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      search: query.search,
      specialization: query.specialization,
      hospital: query.hospital,
      from: toDateParam(query.from),
      to: toDateParam(query.to),
      sort: query.sort,
    }),
    [query]
  )
  const { data, error, isPending, isPlaceholderData, refetch } = useDoctors(params)

  // Any filter change returns to page 1.
  const setFilter = useCallback((patch: Partial<typeof query>) => setQuery({ ...patch, page: 1 }), [setQuery])
  const onEdit = useCallback((doctor: Doctor) => {
    setEditing(doctor)
    setFormOpen(true)
  }, [])
  const onDelete = useCallback((doctor: Doctor) => setDeleting(doctor), [])
  const onPageChange = useCallback((page: number) => setQuery({ page }), [setQuery])
  const onLimitChange = useCallback((limit: number) => setQuery({ limit, page: 1 }), [setQuery])

  const activeCount = [query.specialization, query.hospital, query.from].filter(Boolean).length
  const hasQuery = activeCount > 0 || Boolean(query.search)
  const clear = () => setQuery({ search: "", specialization: null, hospital: null, from: null, to: null, page: 1 })
  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const sort = <SortSelect value={query.sort} onChange={(s) => setQuery({ sort: s })} options={sortOptions} className={isMobile ? undefined : "w-44"} />

  return (
    <>
      <PageHeader
        title={d.admin.doctorsTitle}
        description={d.admin.doctorsBody}
        actions={
          <Button onClick={openCreate}>
            <Plus />
            {d.admin.addDoctor}
          </Button>
        }
      />

      <FilterBar
        search={<SearchInput value={query.search} onChange={(search) => setFilter({ search })} placeholder={t.searchPlaceholder} />}
        activeCount={activeCount}
        onClear={clear}
        filters={
          <>
            <FilterSelect
              ariaLabel={t.specialization}
              allLabel={t.allSpecialties}
              options={options?.specializations ?? []}
              getLabel={specialty}
              value={query.specialization}
              onChange={(specialization) => setFilter({ specialization })}
              className="md:w-48"
            />
            <FilterSelect
              ariaLabel={t.hospital}
              allLabel={t.allHospitals}
              options={options?.hospitals ?? []}
              value={query.hospital}
              onChange={(hospital) => setFilter({ hospital })}
              className="md:w-52"
            />
            <DateRangeFilter label={t.dateAdded} value={{ from: query.from, to: query.to }} onChange={({ from, to }) => setFilter({ from, to })} className="md:w-56" />
            {isMobile && sort}
          </>
        }
        trailing={!isMobile && sort}
      />

      <div className={cn("mt-4 overflow-hidden rounded-xl border bg-card transition-opacity", isPlaceholderData && "opacity-60")}>
        {isPending ? (
          <TableSkeleton columns={7} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data.data.length === 0 ? (
          hasQuery ? (
            <EmptyState title={t.noneMatch} description={t.noneMatchBody} action={<Button variant="outline" onClick={clear}>{d.common.clearFilters}</Button>} />
          ) : (
            <EmptyState icon={Stethoscope} title={t.noneYet} description={t.noneYetBody} action={<Button onClick={openCreate}><Plus />{d.admin.addDoctor}</Button>} />
          )
        ) : isMobile ? (
          <ul className="divide-y">
            {data.data.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onEdit={onEdit} onDelete={onDelete} specialty={specialty} />
            ))}
          </ul>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">{t.colDoctor}</TableHead>
                <TableHead>{t.colSpecialization}</TableHead>
                <TableHead>{t.colHospital}</TableHead>
                <TableHead className="text-right">{t.colFee}</TableHead>
                <TableHead className="text-right">{t.colPatients}</TableHead>
                <TableHead>{t.colAdded}</TableHead>
                <TableHead className="w-12"><span className="sr-only">{d.common.actions}</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((doctor) => (
                <DoctorRow key={doctor.id} doctor={doctor} onEdit={onEdit} onDelete={onDelete} specialty={specialty} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && data.meta.total > 0 && (
        <Pagination meta={data.meta} noun={d.nouns.doctors} onPageChange={onPageChange} onLimitChange={onLimitChange} />
      )}

      <DoctorFormDialog open={formOpen} onOpenChange={setFormOpen} doctor={editing} />
      <DeleteDoctorDialog doctor={deleting} onClose={() => setDeleting(null)} />
    </>
  )
}

interface RowProps {
  doctor: Doctor
  onEdit: (doctor: Doctor) => void
  onDelete: (doctor: Doctor) => void
  specialty: (s: string) => string
}

function LoginMark({ hasAccount }: { hasAccount: boolean }) {
  const { d } = useI18n()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-grid size-5 place-items-center rounded-full", hasAccount ? "text-primary" : "text-muted-foreground/40")}>
          <KeyRound className="size-3.5" aria-label={hasAccount ? d.admin.hasLogin : d.admin.noLogin} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{hasAccount ? d.admin.hasLogin : d.admin.noLogin}</TooltipContent>
    </Tooltip>
  )
}

/** Memoized: paging or opening a dialog doesn't re-render unchanged rows. */
const DoctorRow = memo(function DoctorRow({ doctor, onEdit, onDelete, specialty }: RowProps) {
  const { f, href } = useI18n()
  const link = href(`/admin/doctors/${doctor.id}`)
  return (
    <TableRow>
      <TableCell className="max-w-72 py-3 pl-4">
        <div className="flex items-center gap-2">
          <PersonCell name={doctor.name} secondary={doctor.email} href={link} avatarUrl={doctor.avatarUrl} tone="teal" />
          <LoginMark hasAccount={doctor.hasAccount} />
        </div>
      </TableCell>
      <TableCell>{specialty(doctor.specialization)}</TableCell>
      <TableCell className="max-w-56 truncate text-muted-foreground">{doctor.hospital}</TableCell>
      <TableCell className="text-right tabular whitespace-nowrap">{f.money(doctor.consultationFee)}</TableCell>
      <TableCell className="text-right">
        <Link href={link} className="font-heading font-semibold tabular hover:text-primary">
          {f.number(doctor.patientCount)}
        </Link>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">{f.date(doctor.createdAt)}</TableCell>
      <TableCell className="pr-3">
        <DoctorRowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
})

const DoctorCard = memo(function DoctorCard({ doctor, onEdit, onDelete, specialty }: RowProps) {
  const { d, f, tr, href } = useI18n()
  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <PersonCell
          name={doctor.name}
          secondary={`${specialty(doctor.specialization)}, ${doctor.hospital}`}
          href={href(`/admin/doctors/${doctor.id}`)}
          avatarUrl={doctor.avatarUrl}
          tone="teal"
        />
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-12 text-xs text-muted-foreground">
          <span>{tr(d.doctorsAdmin.patientCount, { count: f.number(doctor.patientCount) })}</span>
          <span>{f.money(doctor.consultationFee)}</span>
          <LoginMark hasAccount={doctor.hasAccount} />
        </div>
      </div>
      <DoctorRowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
    </li>
  )
})
