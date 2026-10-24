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

export const ROLES = ["admin", "doctor", "patient"] as const
export type Role = (typeof ROLES)[number]

/** Where each role lands after signing in. */
export const ROLE_HOME: Record<Role, string> = { admin: "/admin", doctor: "/doctor", patient: "/account" }

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  doctorId?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  phone?: string
  age?: number
  gender?: Gender
  doctor: DoctorSummary | null
  avatarUrl: string | null
  createdAt: string
}

export interface Availability {
  /** 0 = Sunday … 6 = Saturday */
  days: number[]
  start: string
  end: string
  slotMinutes: number
}

export const SLOT_LENGTHS = [15, 20, 30, 45, 60] as const

export interface PublicDoctor {
  id: string
  name: string
  specialization: string
  hospital: string
  consultationFee: number
  bio?: string
  availability: Availability
  avatarUrl: string | null
}

export interface SlotDay {
  date: string
  weekday: number
  slots: { start: string; time: string; available: boolean }[]
}

export interface DoctorSlots {
  timezone: string
  slotMinutes: number
  fee: number
  days: SlotDay[]
}

export const APPOINTMENT_STATUSES = ["pending_payment", "confirmed", "completed", "cancelled", "expired"] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]
export type PaymentMethod = "card" | "bkash" | "nagad"

export interface PaymentInfo {
  id: string
  amount: number
  currency: string
  method: PaymentMethod
  instrument: string
  status: "paid" | "failed" | "refunded"
  transactionId: string
  paidAt: string | null
  refundedAt: string | null
}

export interface Appointment {
  id: string
  doctor: DoctorSummary | null
  patientUser: { id: string; name: string; email: string; phone?: string } | null
  patientRecordId: string | null
  start: string
  end: string
  reason: string
  fee: number
  status: AppointmentStatus
  holdExpiresAt: string | null
  payment: PaymentInfo | null
  cancelledBy: Role | null
  cancellationReason: string | null
  createdAt: string
  serverTime?: string
}

export interface DoctorOverview {
  upcoming: number
  completedThisMonth: number
  revenueThisMonth: number
  patientCount: number
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
  consultationFee: number
  patientCount: number
  hasAccount: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface DoctorDetail extends Doctor {
  bio?: string
  availability: Availability
  patientsByStatus: { status: PatientStatus; count: number }[]
  patientsByCondition: { condition: Condition; count: number }[]
  account: { email: string; lastLoginAt: string | null } | null
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
    bookingsInRange: number
    revenueInRange: number
  }
  patientsOverTime: { date: string; count: number }[]
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; count: number; critical: number }[]
  byCondition: { condition: Condition; count: number }[]
  byStatus: { status: PatientStatus; count: number }[]
  byGender: { gender: Gender; count: number }[]
  byAgeGroup: { group: string; count: number }[]
  doctorsBySpecialization: { specialization: string; count: number }[]
}
