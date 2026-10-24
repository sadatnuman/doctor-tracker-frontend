"use client"

import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}

/** Label + control + error/hint. Pass `aria-invalid` and `aria-describedby={`${id}-message`}` to the control. */
export function FormField({ id, label, error, hint, optional, className, children }: FormFieldProps) {
  const { d } = useI18n()
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-[0.8125rem] font-medium">
        {label}
        {optional && <span className="font-normal text-muted-foreground">{d.common.optional}</span>}
      </Label>
      {children}
      {(error || hint) && (
        <p
          id={`${id}-message`}
          role={error ? "alert" : undefined}
          className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

export const fieldA11y = (id: string, error?: string) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-message` : undefined,
})
