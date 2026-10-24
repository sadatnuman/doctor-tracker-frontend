import { z } from "zod"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { CONDITIONS, GENDERS, SLOT_LENGTHS, STATUSES } from "./types"

/**
 * Form schemas mirror the API's rules so people get instant feedback; the API stays
 * the source of truth. Each is a factory taking the dictionary's validation messages,
 * so errors appear in the reader's language.
 */
type V = Dictionary["validation"]

const phone = (v: V) =>
  z.string().trim().min(7, v.phoneShort).max(20, v.phone).regex(/^[+\d][\d\s\-()]{6,19}$/, v.phone)
const name = (v: V) => z.string().trim().min(2, v.name).max(100)
const email = (v: V) => z.email(v.email).trim().max(120)
const strongPassword = (v: V) =>
  z.string().min(8, v.passwordPolicy).max(72, v.passwordPolicy).regex(/[A-Za-z]/, v.passwordPolicy).regex(/\d/, v.passwordPolicy)
const age = (v: V) =>
  z.coerce.number<string | number>({ error: v.age }).int(v.age).min(0, v.age).max(130, v.age)

export const loginSchema = (v: V) => z.object({ email: email(v), password: z.string().min(1, v.password) })

export const registerSchema = (v: V) =>
  z.object({
    name: name(v),
    email: email(v),
    password: strongPassword(v),
    phone: phone(v),
    age: age(v),
    gender: z.enum(GENDERS, { error: v.choose }),
  })

export const profileSchema = (v: V) =>
  z.object({ name: name(v), phone: phone(v), age: age(v), gender: z.enum(GENDERS, { error: v.choose }) })

export const changePasswordSchema = (v: V) =>
  z.object({ currentPassword: z.string().min(1, v.password), newPassword: strongPassword(v) })

export const doctorAccountSchema = (v: V) => z.object({ password: strongPassword(v) })

export const doctorSchema = (v: V) =>
  z.object({
    name: name(v),
    specialization: z.string().trim().min(2, v.specialization).max(80),
    hospital: z.string().trim().min(2, v.hospital).max(120),
    phone: phone(v),
    email: email(v),
    consultationFee: z.coerce.number<string | number>({ error: v.fee }).int(v.fee).min(0, v.fee).max(100_000, v.fee),
    bio: z.string().trim().max(600).optional(),
    /** Only on create; blank means "no login yet". */
    password: z.union([strongPassword(v), z.literal("")]).optional(),
  })

export const patientSchema = (v: V) =>
  z.object({
    name: name(v),
    age: age(v),
    gender: z.enum(GENDERS, { error: v.choose }),
    phone: phone(v),
    email: z.union([z.email(v.email).trim(), z.literal("")]).optional(),
    condition: z.enum(CONDITIONS, { error: v.choose }),
    status: z.enum(STATUSES),
    admissionDate: z
      .string()
      .min(1, v.required)
      .refine((s) => new Date(s) <= new Date(), v.futureDate),
    notes: z.string().trim().max(1000).optional(),
    doctor: z.string().min(1, v.choose),
  })

const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))

export const availabilitySchema = (v: V) =>
  z
    .object({
      days: z.array(z.number().int().min(0).max(6)).min(1, v.days),
      start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      slotMinutes: z.coerce.number<string | number>().refine((n) => (SLOT_LENGTHS as readonly number[]).includes(n)),
    })
    .refine((a) => toMinutes(a.end) - toMinutes(a.start) >= a.slotMinutes, { message: v.timeRange, path: ["end"] })

export const bookingSchema = (v: V) => z.object({ reason: z.string().trim().min(3, v.reason).max(500) })

export const cardPaymentSchema = (v: V) =>
  z.object({
    method: z.literal("card"),
    cardholder: z.string().trim().min(2, v.name).max(60),
    cardNumber: z.string().transform((s) => s.replace(/[\s-]/g, "")).pipe(z.string().regex(/^\d{12,19}$/, v.cardNumber)),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, v.expiry),
    cvc: z.string().regex(/^\d{3,4}$/, v.cvc),
  })

export const walletPaymentSchema = (v: V) =>
  z.object({
    method: z.enum(["bkash", "nagad"]),
    walletNumber: z.string().transform((s) => s.replace(/[\s-]/g, "")).pipe(z.string().regex(/^01[3-9]\d{8}$/, v.wallet)),
    pin: z.string().regex(/^\d{4,6}$/, v.pin),
  })

export type LoginValues = z.infer<ReturnType<typeof loginSchema>>
export type RegisterFormInput = z.input<ReturnType<typeof registerSchema>>
export type RegisterValues = z.output<ReturnType<typeof registerSchema>>
export type ProfileValues = z.infer<ReturnType<typeof profileSchema>>
export type ChangePasswordValues = z.infer<ReturnType<typeof changePasswordSchema>>
export type DoctorFormInput = z.input<ReturnType<typeof doctorSchema>>
export type DoctorValues = z.output<ReturnType<typeof doctorSchema>>
export type PatientFormInput = z.input<ReturnType<typeof patientSchema>>
export type PatientValues = z.output<ReturnType<typeof patientSchema>>
export type AvailabilityFormInput = z.input<ReturnType<typeof availabilitySchema>>
export type AvailabilityValues = z.output<ReturnType<typeof availabilitySchema>>
export type CardPaymentValues = z.output<ReturnType<typeof cardPaymentSchema>>
export type WalletPaymentValues = z.output<ReturnType<typeof walletPaymentSchema>>
