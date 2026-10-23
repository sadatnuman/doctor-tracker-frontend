"use client"

import { MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { useQueryStates } from "nuqs"
import { memo, useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { PersonCell } from "@/components/common/person-cell"
import { EmptyState, ErrorState } from "@/components/common/states"
import { ConditionTag, STATUS_COLOR, StatusBadge } from "@/components/common/status-badge"
import { DateRangeFilter } from "@/components/data/date-range-filter"
import { FilterBar } from "@/components/data/filter-bar"
import { FilterSelect } from "@/components/data/filter-select"
import { MultiFilter } from "@/components/data/multi-filter"
import { Pagination } from "@/components/data/pagination"
import { SearchInput } from "@/components/data/search-input"
import { SortSelect } from "@/components/data/sort-select"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { DoctorPicker } from "@/components/doctors/doctor-picker"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDeletePatient, usePatients } from "@/hooks/use-patients"
import { formatDate, toDateParam } from "@/lib/format"
import { patientListParams, type PATIENT_SORTS } from "@/lib/search-params"
import { CONDITIONS, GENDERS, STATUSES, type DoctorSummary, type Patient } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PatientFormDialog } from "./patient-form-dialog"

const SORT_OPTIONS: { value: (typeof PATIENT_SORTS)[number]; label: string }[] = [
  { value: "-admissionDate", label: "Latest admission" },
  { value: "admissionDate", label: "Earliest admission" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "-age", label: "Oldest first" },
  { value: "age", label: "Youngest first" },
]

const AGE_BANDS = ["0–17", "18–39", "40–64", "65+"] as const
const AGE_RANGES: Record<(typeof AGE_BANDS)[number], [number, number | null]> = {
  "0–17": [0, 17],
  "18–39": [18, 39],
  "40–64": [40, 64],
  "65+": [65, null],
}

interface PatientListProps {
  /** Scope the list to one doctor (doctor detail page): hides the doctor filter/column. */
  doctor?: Pick<DoctorSummary, "id" | "name">
  /** Rendered above the filters; receives a callback that opens the "add patient" dialog. */
  header?: (openCreate: () => void) => React.ReactNode
}

export function PatientList({ doctor, header }: PatientListProps) {
  const [query, setQuery] = useQueryStates(patientListParams, { history: "replace" })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | undefined>()
  const [deleting, setDeleting] = useState<Patient | null>(null)
  const isMobile = useIsMobile()
  const remove = useDeletePatient()

  const params = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      search: query.search,
      condition: query.condition,
      status: query.status,
      gender: query.gender,
      doctor: doctor ? undefined : query.doctor,
      ageMin: query.ageMin,
      ageMax: query.ageMax,
      from: toDateParam(query.from),
      to: toDateParam(query.to),
      sort: query.sort,
    }),
    [query, doctor]
  )
  const { data, error, isPending, isPlaceholderData, refetch } = usePatients(params, doctor?.id)

  const setFilter = useCallback((patch: Partial<typeof query>) => setQuery({ ...patch, page: 1 }), [setQuery])
  const openCreate = useCallback(() => {
    setEditing(undefined)
    setFormOpen(true)
  }, [])
  const onEdit = useCallback((patient: Patient) => {
    setEditing(patient)
    setFormOpen(true)
  }, [])
  const onDelete = useCallback((patient: Patient) => setDeleting(patient), [])
  const onPageChange = useCallback((page: number) => setQuery({ page }), [setQuery])
  const onLimitChange = useCallback((limit: number) => setQuery({ limit, page: 1 }), [setQuery])

  const ageBand =
    AGE_BANDS.find((band) => AGE_RANGES[band][0] === query.ageMin && AGE_RANGES[band][1] === query.ageMax) ?? null

  const activeCount =
    (query.condition.length ? 1 : 0) +
    (query.status.length ? 1 : 0) +
    [query.gender, query.from, !doctor && query.doctor, query.ageMin !== null || query.ageMax !== null].filter(Boolean).length
  const hasQuery = activeCount > 0 || Boolean(query.search)
  const clear = () =>
    setQuery({ search: "", condition: [], status: [], gender: null, doctor: null, ageMin: null, ageMax: null, from: null, to: null, page: 1 })

  const confirmDelete = () => {
    if (!deleting) return
    const patient = deleting
    setDeleting(null) // optimistic: the row disappears immediately
    remove.mutate(
      { id: patient.id, doctorId: doctor?.id },
      { onSuccess: () => toast.success(`${patient.name} removed${doctor ? ` from ${doctor.name}’s patients` : ""}`) }
    )
  }

  const sort = <SortSelect value={query.sort} onChange={(s) => setQuery({ sort: s })} options={SORT_OPTIONS} className={isMobile ? undefined : "w-48"} />

  return (
    <>
      {header?.(openCreate)}
      <FilterBar
          search={<SearchInput value={query.search} onChange={(search) => setFilter({ search })} placeholder="Search by name or email" />}
          activeCount={activeCount}
          onClear={clear}
          filters={
            <>
              <MultiFilter
                label="Condition"
                options={CONDITIONS}
                value={query.condition}
                onChange={(condition) => setFilter({ condition })}
                className="md:w-40"
              />
              <MultiFilter
                label="Status"
                options={STATUSES}
                value={query.status}
                onChange={(status) => setFilter({ status })}
                renderOption={(s) => (
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
                    {s}
                  </span>
                )}
                className="md:w-36"
              />
              {!doctor && (
                <DoctorPicker allowAll value={query.doctor} onChange={(id) => setFilter({ doctor: id })} className="md:w-52" />
              )}
              <FilterSelect
                ariaLabel="Gender"
                allLabel="Any gender"
                options={GENDERS}
                value={query.gender}
                onChange={(gender) => setFilter({ gender: gender as Patient["gender"] | null })}
                className="md:w-32"
              />
              <FilterSelect
                ariaLabel="Age"
                allLabel="Any age"
                options={AGE_BANDS}
                value={ageBand}
                onChange={(band) => {
                  const [ageMin, ageMax] = band ? AGE_RANGES[band as (typeof AGE_BANDS)[number]] : [null, null]
                  setFilter({ ageMin, ageMax })
                }}
                className="md:w-28"
              />
              <DateRangeFilter
                label="Admission date"
                value={{ from: query.from, to: query.to }}
                onChange={({ from, to }) => setFilter({ from, to })}
                className="md:w-56"
              />
              {isMobile && sort}
            </>
          }
          trailing={!isMobile && sort}
        />

      <div className={cn("mt-4 overflow-hidden rounded-xl border bg-card transition-opacity", isPlaceholderData && "opacity-60")}>
        {isPending ? (
          <TableSkeleton columns={doctor ? 6 : 7} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data.data.length === 0 ? (
          hasQuery ? (
            <EmptyState title="No patients match these filters" description="Try another search term or clear the filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
          ) : (
            <EmptyState
              icon={Users}
              title={doctor ? `${doctor.name} has no patients yet` : "No patients yet"}
              description={doctor ? "Add the first patient to start this caseload." : "Patients are added from a doctor’s page or right here."}
              action={<Button onClick={openCreate}><Plus />Add patient</Button>}
            />
          )
        ) : isMobile ? (
          <ul className="divide-y">
            {data.data.map((patient) => (
              <PatientCard key={patient.id} patient={patient} showDoctor={!doctor} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </ul>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                {!doctor && <TableHead>Doctor</TableHead>}
                <TableHead>Admitted</TableHead>
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((patient) => (
                <PatientRow key={patient.id} patient={patient} showDoctor={!doctor} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && data.meta.total > 0 && (
        <Pagination meta={data.meta} noun={["patient", "patients"]} onPageChange={onPageChange} onLimitChange={onLimitChange} />
      )}

      <PatientFormDialog open={formOpen} onOpenChange={setFormOpen} patient={editing} doctor={editing ? undefined : doctor} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={doctor ? `Remove ${deleting?.name ?? "patient"}?` : `Delete ${deleting?.name ?? "patient"}?`}
        description={
          doctor
            ? `This removes the patient from ${doctor.name}’s list and deletes their record. This can’t be undone.`
            : "This permanently deletes the patient’s record. This can’t be undone."
        }
        confirmLabel={doctor ? "Remove patient" : "Delete patient"}
        onConfirm={confirmDelete}
      />
    </>
  )
}

interface RowProps {
  patient: Patient
  showDoctor: boolean
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

const PatientActions = memo(function PatientActions({ patient, onEdit, onDelete, showDoctor }: RowProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${patient.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onEdit(patient)}>
          <Pencil />
          Edit patient
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(patient)}>
          <Trash2 />
          {showDoctor ? "Delete patient" : "Remove patient"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

const PatientRow = memo(function PatientRow(props: RowProps) {
  const { patient, showDoctor } = props
  return (
    <TableRow>
      <TableCell className="max-w-64 py-3 pl-4">
        <PersonCell name={patient.name} secondary={patient.email ?? patient.phone} />
      </TableCell>
      <TableCell className="tabular whitespace-nowrap">
        {patient.age} <span className="text-muted-foreground">{patient.gender === "Other" ? "" : patient.gender[0]}</span>
      </TableCell>
      <TableCell><ConditionTag condition={patient.condition} /></TableCell>
      <TableCell><StatusBadge status={patient.status} /></TableCell>
      {showDoctor && (
        <TableCell className="max-w-52">
          {patient.doctor ? (
            <Link href={`/doctors/${patient.doctor.id}`} className="grid min-w-0 hover:text-primary">
              <span className="truncate">{patient.doctor.name}</span>
              <span className="truncate text-xs text-muted-foreground">{patient.doctor.specialization}</span>
            </Link>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </TableCell>
      )}
      <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(patient.admissionDate)}</TableCell>
      <TableCell className="pr-3"><PatientActions {...props} /></TableCell>
    </TableRow>
  )
})

const PatientCard = memo(function PatientCard(props: RowProps) {
  const { patient, showDoctor } = props
  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <PersonCell name={patient.name} secondary={`${patient.age} yrs, ${patient.gender}`} />
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-12">
          <StatusBadge status={patient.status} />
          <ConditionTag condition={patient.condition} />
        </div>
        <p className="mt-2 truncate pl-12 text-xs text-muted-foreground">
          Admitted {formatDate(patient.admissionDate)}
          {showDoctor && patient.doctor && <> with {patient.doctor.name}</>}
        </p>
      </div>
      <PatientActions {...props} />
    </li>
  )
})
