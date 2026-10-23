import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs"
import { CONDITIONS, GENDERS, STATUSES } from "./types"

/** List state lives in the URL: shareable, bookmarkable, and back/forward-friendly. */

export const PAGE_SIZES = [10, 20, 50] as const

const pagination = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  from: parseAsIsoDate,
  to: parseAsIsoDate,
}

export const DOCTOR_SORTS = ["-createdAt", "createdAt", "name", "-name", "specialization", "hospital"] as const

export const doctorListParams = {
  ...pagination,
  specialization: parseAsString,
  hospital: parseAsString,
  sort: parseAsStringLiteral(DOCTOR_SORTS).withDefault("-createdAt"),
}

export const PATIENT_SORTS = ["-admissionDate", "admissionDate", "name", "-name", "age", "-age"] as const

export const patientListParams = {
  ...pagination,
  condition: parseAsArrayOf(parseAsStringLiteral(CONDITIONS)).withDefault([]),
  status: parseAsArrayOf(parseAsStringLiteral(STATUSES)).withDefault([]),
  gender: parseAsStringLiteral(GENDERS),
  doctor: parseAsString,
  ageMin: parseAsInteger,
  ageMax: parseAsInteger,
  sort: parseAsStringLiteral(PATIENT_SORTS).withDefault("-admissionDate"),
}

export const RANGE_PRESETS = ["7d", "30d", "90d", "12m", "all"] as const
export type RangePreset = (typeof RANGE_PRESETS)[number]

export const dashboardParams = {
  range: parseAsStringLiteral(RANGE_PRESETS).withDefault("12m"),
}
