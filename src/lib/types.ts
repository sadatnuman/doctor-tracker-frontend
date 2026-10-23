export const CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Cardiac",
  "Fracture",
  "Infection",
  "Migraine",
  "Arthritis",
  "Other",
] as const
// Severity order: also the fixed display order in legends and the stacked status band.
export const STATUSES = ["Critical", "Active", "Recovered", "Discharged"] as const
export const GENDERS = ["Male", "Female", "Other"] as const

export type Condition = (typeof CONDITIONS)[number]
export type PatientStatus = (typeof STATUSES)[number]
export type Gender = (typeof GENDERS)[number]

export interface User {
  id: string
  name: string
  email: string
  role: "admin"
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface Doctor {
  id: string
  name: string
  specialization: string
  hospital: string
  phone: string
  email: string
  patientCount: number
  createdAt: string
  updatedAt: string
}

export interface DoctorDetail extends Doctor {
  patientsByStatus: { status: PatientStatus; count: number }[]
  patientsByCondition: { condition: Condition; count: number }[]
}

export interface DoctorSummary {
  id: string
  name: string
  specialization: string
  hospital: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: Gender
  phone: string
  email?: string
  condition: Condition
  status: PatientStatus
  admissionDate: string
  notes?: string
  doctor: DoctorSummary | null
  createdAt: string
  updatedAt: string
}

export interface FilterOptions {
  specializations: string[]
  hospitals: string[]
  conditions: Condition[]
  statuses: PatientStatus[]
  genders: Gender[]
}

export type Interval = "day" | "week" | "month"

export interface Overview {
  range: { from: string; to: string; interval: Interval }
  totals: {
    doctors: number
    patients: number
    avgPatientsPerDoctor: number
    patientsInRange: number
    previousPeriodPatients: number
    patientsChangePct: number | null
    newDoctorsInRange: number
    criticalInRange: number
  }
  patientsOverTime: { date: string; count: number }[]
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; count: number; critical: number }[]
  byCondition: { condition: Condition; count: number }[]
  byStatus: { status: PatientStatus; count: number }[]
  byGender: { gender: Gender; count: number }[]
  byAgeGroup: { group: string; count: number }[]
  doctorsBySpecialization: { specialization: string; count: number }[]
}
