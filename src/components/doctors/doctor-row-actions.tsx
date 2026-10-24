"use client"

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/i18n/client"
import type { Doctor } from "@/lib/types"

interface DoctorRowActionsProps {
  doctor: Doctor
  onEdit: (doctor: Doctor) => void
  onDelete: (doctor: Doctor) => void
}

export const DoctorRowActions = memo(function DoctorRowActions({ doctor, onEdit, onDelete }: DoctorRowActionsProps) {
  const { d, tr, href } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={tr(d.common.actionsFor, { name: doctor.name })}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={href(`/admin/doctors/${doctor.id}`)}>
            <Eye />
            {d.doctorsAdmin.viewPatients}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(doctor)}>
          <Pencil />
          {d.doctorsAdmin.editDetails}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(doctor)}>
          <Trash2 />
          {d.doctorsAdmin.deleteDoctor}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
