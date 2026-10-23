import { z } from "zod"
import { CONDITIONS, GENDERS, STATUSES } from "./types"

// Mirrors the API's zod schemas so users get instant feedback; the API stays the source of truth.

const phone = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^[+\d][\d\s\-()]{6,19}$/, "Use digits, spaces, dashes or a leading +")

const name = z.string().trim().min(2, "Name must be at least 2 characters").max(100)

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim(),
  password: z.string().min(1, "Enter your password"),
})

export const doctorSchema = z.object({
  name,
  specialization: z.string().trim().min(2, "Choose or type a specialization").max(80),
  hospital: z.string().trim().min(2, "Enter the hospital").max(120),
  phone,
  email: z.email("Enter a valid email address").trim().max(120),
})

export const patientSchema = z.object({
  name,
  age: z.coerce
    .number<string | number>({ error: "Enter an age" })
    .int("Age must be a whole number")
    .min(0, "Age can't be negative")
    .max(130, "Enter a realistic age"),
  gender: z.enum(GENDERS, { error: "Choose a gender" }),
  phone,
  email: z.union([z.email("Enter a valid email address").trim(), z.literal("")]).optional(),
  condition: z.enum(CONDITIONS, { error: "Choose a condition" }),
  status: z.enum(STATUSES),
  admissionDate: z
    .string()
    .min(1, "Choose the admission date")
    .refine((v) => new Date(v) <= new Date(), "Admission date can't be in the future"),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters").optional(),
  doctor: z.string().min(1, "Choose a doctor"),
})

export type LoginValues = z.infer<typeof loginSchema>
export type DoctorValues = z.infer<typeof doctorSchema>
export type PatientFormInput = z.input<typeof patientSchema>
export type PatientValues = z.output<typeof patientSchema>
