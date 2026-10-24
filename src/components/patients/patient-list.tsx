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
import { useI18n } from "@/i18n/client"
import { toDateParam } from "@/lib/format"
import { patientListParams, PATIENT_SORTS } from "@/lib/search-params"
import { CONDITIONS, GENDERS, STATUSES, type DoctorSummary, type Gender, type Patient } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PatientFormDialog } from "./patient-form-dialog"

const AGE_BANDS = ["0–17", "18–39", "40–64", "65+"] as const
type AgeBand = (typeof AGE_BANDS)[number]
const AGE_RANGES: Record<AgeBand, [number, number | null]> = {
  "0–17": [0, 17],
  "18–39": [18, 39],
  "40–64": [40, 64],
  "65+": [65, null],
}

interface PatientListProps {
  /** Scope the list to one doctor (doctor profile, doctor workspace): hides the doctor filter/column. */
  doctor?: Pick<DoctorSummary, "id" | "name">
  /** Rendered above the filters; receives a callback that opens the "add patient" dialog. */
  header?: (openCreate: () => void) => React.ReactNode
  /** Only administrators may reassign a patient to another doctor. */
  canReassign?: boolean
}

export function PatientList({ doctor, header, canReassign = true }: PatientListProps) {
  const { d, tr } = useI18n()
  const t = d.patientsAdmin
  const [query, setQuery] = useQueryStates(patientListParams, { history: "replace" })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | undefined>()
  const [deleting, setDeleting] = useState<Patient | null>(null)
  const isMobile = useIsMobile()
  const remove = useDeletePatient()
  const sortOptions = PATIENT_SORTS.map((value) => ({ value, label: t.sort[value] }))

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

  const ageBand = AGE_BANDS.find((band) => AGE_RANGES[band][0] === query.ageMin && AGE_RANGES[band][1] === query.ageMax) ?? null

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
      {
        onSuccess: () =>
          toast.success(doctor ? tr(t.removedFrom, { name: patient.name, doctor: doctor.name }) : tr(t.removed, { name: patient.name })),
      }
    )
  }

  const sort = <SortSelect value={query.sort} onChange={(s) => setQuery({ sort: s })} options={sortOptions} className={isMobile ? undefined : "w-48"} />

  return (
    <>
      {header?.(openCreate)}
      <FilterBar
        search={<SearchInput value={query.search} onChange={(search) => setFilter({ search })} placeholder={t.searchPlaceholder} />}
        activeCount={activeCount}
        onClear={clear}
        filters={
          <>
            <MultiFilter
              label={t.condition}
              options={CONDITIONS}
              value={query.condition}
              getLabel={(c) => d.enums.condition[c]}
              onChange={(condition) => setFilter({ condition })}
              className="md:w-40"
            />
            <MultiFilter
              label={t.status}
              options={STATUSES}
              value={query.status}
              getLabel={(s) => d.enums.status[s]}
              onChange={(status) => setFilter({ status })}
              renderOption={(s) => (
                <span className="flex items-center gap-2">
                  <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
                  {d.enums.status[s]}
                </span>
              )}
              className="md:w-36"
            />
            {!doctor && <DoctorPicker allowAll value={query.doctor} onChange={(id) => setFilter({ doctor: id })} className="md:w-52" />}
            <FilterSelect
              ariaLabel={t.gender}
              allLabel={t.anyGender}
              options={GENDERS}
              getLabel={(g) => d.enums.gender[g as Gender]}
              value={query.gender}
              onChange={(gender) => setFilter({ gender: gender as Gender | null })}
              className="md:w-32"
            />
            <FilterSelect
              ariaLabel={t.age}
              allLabel={t.anyAge}
              options={AGE_BANDS}
              getLabel={(b) => t.ageBands[b as AgeBand]}
              value={ageBand}
              onChange={(band) => {
                const [ageMin, ageMax] = band ? AGE_RANGES[band as AgeBand] : [null, null]
                setFilter({ ageMin, ageMax })
              }}
              className="md:w-28"
            />
            <DateRangeFilter label={t.admissionDate} value={{ from: query.from, to: query.to }} onChange={({ from, to }) => setFilter({ from, to })} className="md:w-56" />
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
            <EmptyState title={t.noneMatch} description={t.noneMatchBody} action={<Button variant="outline" onClick={clear}>{d.common.clearFilters}</Button>} />
          ) : (
            <EmptyState
              icon={Users}
              title={doctor ? tr(t.noneYetDoctor, { name: doctor.name }) : t.noneYet}
              description={doctor ? t.noneYetDoctorBody : t.noneYetBody}
              action={
                <Button onClick={openCreate}>
                  <Plus />
                  {d.admin.addPatient}
                </Button>
              }
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
                <TableHead className="pl-4">{t.colPatient}</TableHead>
                <TableHead>{t.colAge}</TableHead>
                <TableHead>{t.colCondition}</TableHead>
                <TableHead>{t.colStatus}</TableHead>
                {!doctor && <TableHead>{t.colDoctor}</TableHead>}
                <TableHead>{t.colAdmitted}</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">{d.common.actions}</span>
                </TableHead>
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
        <Pagination meta={data.meta} noun={d.nouns.patients} onPageChange={onPageChange} onLimitChange={onLimitChange} />
      )}

      <PatientFormDialog open={formOpen} onOpenChange={setFormOpen} patient={editing} doctor={editing ? undefined : doctor} canReassign={canReassign} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={tr(doctor ? t.removeTitle : t.deleteTitle, { name: deleting?.name ?? "" })}
        description={doctor ? tr(t.removeBody, { doctor: doctor.name }) : t.deleteBody}
        confirmLabel={doctor ? t.removePatient : t.deletePatient}
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
  const { d, tr } = useI18n()
  const t = d.patientsAdmin
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={tr(d.common.actionsFor, { name: patient.name })}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onEdit(patient)}>
          <Pencil />
          {t.editPatient}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(patient)}>
          <Trash2 />
          {showDoctor ? t.deletePatient : t.removePatient}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

const PatientRow = memo(function PatientRow(props: RowProps) {
  const { patient, showDoctor } = props
  const { d, f, href } = useI18n()
  return (
    <TableRow>
      <TableCell className="max-w-64 py-3 pl-4">
        <PersonCell name={patient.name} secondary={patient.email ?? patient.phone} />
      </TableCell>
      <TableCell className="tabular whitespace-nowrap">
        {f.number(patient.age)} <span className="text-muted-foreground">{d.enums.gender[patient.gender]}</span>
      </TableCell>
      <TableCell>
        <ConditionTag condition={patient.condition} />
      </TableCell>
      <TableCell>
        <StatusBadge status={patient.status} />
      </TableCell>
      {showDoctor && (
        <TableCell className="max-w-52">
          {patient.doctor ? (
            <Link href={href(`/admin/doctors/${patient.doctor.id}`)} className="grid min-w-0 hover:text-primary">
              <span className="truncate">{patient.doctor.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {d.enums.specialization[patient.doctor.specialization] ?? patient.doctor.specialization}
              </span>
            </Link>
          ) : (
            <span className="text-muted-foreground">{d.patientsAdmin.unassigned}</span>
          )}
        </TableCell>
      )}
      <TableCell className="whitespace-nowrap text-muted-foreground">{f.date(patient.admissionDate)}</TableCell>
      <TableCell className="pr-3">
        <PatientActions {...props} />
      </TableCell>
    </TableRow>
  )
})

const PatientCard = memo(function PatientCard(props: RowProps) {
  const { patient, showDoctor } = props
  const { d, f, tr } = useI18n()
  const t = d.patientsAdmin
  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <PersonCell name={patient.name} secondary={tr(t.yearsGender, { age: f.number(patient.age), gender: d.enums.gender[patient.gender] })} />
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-12">
          <StatusBadge status={patient.status} />
          <ConditionTag condition={patient.condition} />
        </div>
        <p className="mt-2 truncate pl-12 text-xs text-muted-foreground">
          {showDoctor && patient.doctor
            ? tr(t.admittedWith, { date: f.date(patient.admissionDate), doctor: patient.doctor.name })
            : tr(t.admittedOn, { date: f.date(patient.admissionDate) })}
        </p>
      </div>
      <PatientActions {...props} />
    </li>
  )
})
