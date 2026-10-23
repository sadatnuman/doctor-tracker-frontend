"use client"

import { Plus, Stethoscope } from "lucide-react"
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
import { useDoctors, useFilterOptions } from "@/hooks/use-doctors"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatDate, formatNumber, toDateParam } from "@/lib/format"
import { doctorListParams, type DOCTOR_SORTS } from "@/lib/search-params"
import type { Doctor } from "@/lib/types"
import { cn } from "@/lib/utils"
import { DeleteDoctorDialog } from "./delete-doctor-dialog"
import { DoctorFormDialog } from "./doctor-form-dialog"
import { DoctorRowActions } from "./doctor-row-actions"

const SORT_OPTIONS: { value: (typeof DOCTOR_SORTS)[number]; label: string }[] = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "specialization", label: "Specialization" },
  { value: "hospital", label: "Hospital" },
]

export function DoctorsView() {
  const [query, setQuery] = useQueryStates(doctorListParams, { history: "replace" })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | undefined>()
  const [deleting, setDeleting] = useState<Doctor | null>(null)
  const isMobile = useIsMobile()
  const { data: options } = useFilterOptions()

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

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Everyone on the roster, with how many patients each is responsible for."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
          >
            <Plus />
            Add doctor
          </Button>
        }
      />

      <FilterBar
        search={<SearchInput value={query.search} onChange={(search) => setFilter({ search })} placeholder="Search by name or email" />}
        activeCount={activeCount}
        onClear={clear}
        filters={
          <>
            <FilterSelect
              ariaLabel="Specialization"
              allLabel="All specializations"
              options={options?.specializations ?? []}
              value={query.specialization}
              onChange={(specialization) => setFilter({ specialization })}
              className="md:w-48"
            />
            <FilterSelect
              ariaLabel="Hospital"
              allLabel="All hospitals"
              options={options?.hospitals ?? []}
              value={query.hospital}
              onChange={(hospital) => setFilter({ hospital })}
              className="md:w-52"
            />
            <DateRangeFilter
              label="Date added"
              value={{ from: query.from, to: query.to }}
              onChange={({ from, to }) => setFilter({ from, to })}
              className="md:w-56"
            />
            {isMobile && <SortSelect value={query.sort} onChange={(sort) => setQuery({ sort })} options={SORT_OPTIONS} />}
          </>
        }
        trailing={!isMobile && <SortSelect value={query.sort} onChange={(sort) => setQuery({ sort })} options={SORT_OPTIONS} className="w-44" />}
      />

      <div className={cn("mt-4 overflow-hidden rounded-xl border bg-card transition-opacity", isPlaceholderData && "opacity-60")}>
        {isPending ? (
          <TableSkeleton columns={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data.data.length === 0 ? (
          hasQuery ? (
            <EmptyState title="No doctors match these filters" description="Try a different name or clear the filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={Stethoscope} title="No doctors yet" description="Add your first doctor to start assigning patients." action={<Button onClick={() => setFormOpen(true)}><Plus />Add doctor</Button>} />
          )
        ) : isMobile ? (
          <ul className="divide-y">
            {data.data.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </ul>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Doctor</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Patients</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((doctor) => (
                <DoctorRow key={doctor.id} doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && data.meta.total > 0 && (
        <Pagination meta={data.meta} noun={["doctor", "doctors"]} onPageChange={onPageChange} onLimitChange={onLimitChange} />
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
}

/** Memoized: paging or opening a dialog doesn't re-render unchanged rows. */
const DoctorRow = memo(function DoctorRow({ doctor, onEdit, onDelete }: RowProps) {
  return (
    <TableRow>
      <TableCell className="max-w-72 py-3 pl-4">
        <PersonCell name={doctor.name} secondary={doctor.email} href={`/doctors/${doctor.id}`} tone="teal" />
      </TableCell>
      <TableCell>{doctor.specialization}</TableCell>
      <TableCell className="max-w-56 truncate text-muted-foreground">{doctor.hospital}</TableCell>
      <TableCell className="text-muted-foreground tabular whitespace-nowrap">{doctor.phone}</TableCell>
      <TableCell className="text-right">
        <Link href={`/doctors/${doctor.id}`} className="font-heading font-semibold tabular hover:text-primary">
          {formatNumber(doctor.patientCount)}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(doctor.createdAt)}</TableCell>
      <TableCell className="pr-3">
        <DoctorRowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
})

const DoctorCard = memo(function DoctorCard({ doctor, onEdit, onDelete }: RowProps) {
  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <PersonCell name={doctor.name} secondary={`${doctor.specialization}, ${doctor.hospital}`} href={`/doctors/${doctor.id}`} tone="teal" />
        <div className="mt-2.5 flex items-center gap-4 pl-12 text-xs text-muted-foreground">
          <span>
            <span className="font-heading text-sm font-semibold text-foreground tabular">{formatNumber(doctor.patientCount)}</span>{" "}
            {doctor.patientCount === 1 ? "patient" : "patients"}
          </span>
          <span>Added {formatDate(doctor.createdAt)}</span>
        </div>
      </div>
      <DoctorRowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
    </li>
  )
})
