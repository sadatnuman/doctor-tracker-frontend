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
import type { Doctor } from "@/lib/types"

interface DoctorRowActionsProps {
  doctor: Doctor
  onEdit: (doctor: Doctor) => void
  onDelete: (doctor: Doctor) => void
}

export const DoctorRowActions = memo(function DoctorRowActions({ doctor, onEdit, onDelete }: DoctorRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${doctor.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/doctors/${doctor.id}`}>
            <Eye />
            View patients
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(doctor)}>
          <Pencil />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(doctor)}>
          <Trash2 />
          Delete doctor
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
