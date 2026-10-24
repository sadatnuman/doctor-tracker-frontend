"use client"

import { AlertTriangle, RotateCw, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon = SearchX, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="mb-4 grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <p className="font-heading text-base font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, className }: { error: Error; onRetry?: () => void; className?: string }) {
  const { d } = useI18n()
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="mb-4 grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <p className="font-heading text-base font-semibold">{d.common.couldNotLoad}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{localizeError(error, d.errors)}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          <RotateCw />
          {d.common.retry}
        </Button>
      )}
    </div>
  )
}
