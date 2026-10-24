"use client"

import { CreditCard, Info, Loader2, Smartphone } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { usePayAppointment } from "@/hooks/use-appointments"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"
import type { Appointment, PaymentMethod } from "@/lib/types"
import {
  cardPaymentSchema,
  walletPaymentSchema,
  type CardPaymentInput,
  type CardPaymentValues,
  type WalletPaymentInput,
  type WalletPaymentValues,
} from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

/** "4242424242424242" → "4242 4242 4242 4242" while typing. */
const groupCard = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

/** Simulated checkout: validates like a real gateway, no money moves. */
export function PaymentForm({ appointment }: { appointment: Appointment }) {
  const { d, tr, f } = useI18n()
  const t = d.booking
  const [method, setMethod] = useState<PaymentMethod>("card")
  const pay = usePayAppointment(appointment.id)
  const amount = f.money(appointment.fee)

  return (
    <div className="grid gap-5">
      <div>
        <p className="mb-2 text-sm font-medium">{t.method}</p>
        <ToggleGroup type="single" variant="outline" value={method} onValueChange={(v) => v && setMethod(v as PaymentMethod)} className="w-full">
          <ToggleGroupItem value="card" className="flex-1 gap-2 data-[state=on]:bg-accent data-[state=on]:font-semibold data-[state=on]:text-accent-foreground">
            <CreditCard /> {t.card}
          </ToggleGroupItem>
          <ToggleGroupItem value="bkash" className="flex-1 gap-2 data-[state=on]:bg-accent data-[state=on]:font-semibold data-[state=on]:text-accent-foreground">
            <Smartphone /> {t.bkash}
          </ToggleGroupItem>
          <ToggleGroupItem value="nagad" className="flex-1 gap-2 data-[state=on]:bg-accent data-[state=on]:font-semibold data-[state=on]:text-accent-foreground">
            <Smartphone /> {t.nagad}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {method === "card" ? (
        <CardFields key="card" amount={amount} pay={pay} />
      ) : (
        <WalletFields key={method} method={method} amount={amount} pay={pay} />
      )}

      {pay.error && (
        <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive">
          {localizeError(pay.error, d.errors)}
        </p>
      )}

      <p className="flex gap-2 rounded-lg border border-dashed bg-muted/40 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        {t.testCards}
      </p>
      <p className="sr-only">{tr(t.payAction, { amount })}</p>
    </div>
  )
}

type Pay = ReturnType<typeof usePayAppointment>

function CardFields({ amount, pay }: { amount: string; pay: Pay }) {
  const { d, tr } = useI18n()
  const t = d.booking
  const resolver = useMemo(() => zodResolver(cardPaymentSchema(d.validation)), [d])
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CardPaymentInput, unknown, CardPaymentValues>({ resolver, defaultValues: { method: "card", cardholder: "", cardNumber: "", expiry: "", cvc: "" } })

  return (
    <form onSubmit={handleSubmit((values) => pay.mutate(values))} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField id="cardholder" label={t.cardholder} error={errors.cardholder?.message} className="sm:col-span-2">
        <Input {...fieldA11y("cardholder", errors.cardholder?.message)} autoComplete="cc-name" {...register("cardholder")} />
      </FormField>
      <FormField id="card-number" label={t.cardNumber} error={errors.cardNumber?.message} className="sm:col-span-2">
        <Input
          {...fieldA11y("card-number", errors.cardNumber?.message)}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          className="tabular"
          {...register("cardNumber", { onChange: (e) => setValue("cardNumber", groupCard(e.target.value)) })}
        />
      </FormField>
      <FormField id="card-expiry" label={t.expiry} error={errors.expiry?.message}>
        <Input
          {...fieldA11y("card-expiry", errors.expiry?.message)}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="12/30"
          className="tabular"
          {...register("expiry", { onChange: (e) => setValue("expiry", formatExpiry(e.target.value)) })}
        />
      </FormField>
      <FormField id="card-cvc" label={t.cvc} error={errors.cvc?.message}>
        <PasswordInput {...fieldA11y("card-cvc", errors.cvc?.message)} inputMode="numeric" autoComplete="cc-csc" maxLength={4} {...register("cvc")} />
      </FormField>
      <Button type="submit" size="lg" className="h-11 sm:col-span-2" disabled={pay.isPending}>
        {pay.isPending && <Loader2 className="animate-spin" />}
        {pay.isPending ? t.paying : tr(t.payAction, { amount })}
      </Button>
    </form>
  )
}

function WalletFields({ method, amount, pay }: { method: "bkash" | "nagad"; amount: string; pay: Pay }) {
  const { d, tr } = useI18n()
  const t = d.booking
  const resolver = useMemo(() => zodResolver(walletPaymentSchema(d.validation)), [d])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WalletPaymentInput, unknown, WalletPaymentValues>({ resolver, defaultValues: { method, walletNumber: "", pin: "" } })
  const wallet = method === "bkash" ? t.bkash : t.nagad

  return (
    <form onSubmit={handleSubmit((values) => pay.mutate(values))} noValidate className="grid gap-4">
      <FormField id="wallet-number" label={tr(t.walletNumber, { wallet })} error={errors.walletNumber?.message}>
        <Input {...fieldA11y("wallet-number", errors.walletNumber?.message)} type="tel" inputMode="numeric" placeholder="01712345678" className="tabular" {...register("walletNumber")} />
      </FormField>
      <FormField id="wallet-pin" label={t.pin} error={errors.pin?.message}>
        <PasswordInput {...fieldA11y("wallet-pin", errors.pin?.message)} inputMode="numeric" autoComplete="off" maxLength={6} {...register("pin")} />
      </FormField>
      <Button type="submit" size="lg" className="h-11" disabled={pay.isPending}>
        {pay.isPending && <Loader2 className="animate-spin" />}
        {pay.isPending ? t.paying : tr(t.payAction, { amount })}
      </Button>
    </form>
  )
}
