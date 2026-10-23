import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { ApiError } from "./api"

/**
 * Maps API validation (400) and uniqueness (409) errors onto form fields.
 * Returns true when at least one field received an error.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: readonly string[]) {
  if (!(error instanceof ApiError)) return false
  let applied = false

  for (const { field, message } of error.fieldErrors) {
    if (fields.includes(field)) {
      setError(field as Path<T>, { type: "server", message })
      applied = true
    }
  }

  const conflictField = (error.details as { field?: string } | undefined)?.field
  if (error.status === 409 && conflictField && fields.includes(conflictField)) {
    setError(conflictField as Path<T>, { type: "server", message: `This ${conflictField} is already in use` })
    applied = true
  }

  return applied
}
