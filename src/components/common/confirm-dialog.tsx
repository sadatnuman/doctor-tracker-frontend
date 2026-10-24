"use client"

import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel: string
  pending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, pending, onConfirm }: ConfirmDialogProps) {
  const { d } = useI18n()
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{d.common.cancel}</AlertDialogCancel>
          {/* A plain Button (not AlertDialogAction) so the dialog stays open while the request runs. */}
          <Button variant="destructive" onClick={onConfirm} disabled={pending} className="bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive">
            {pending && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
