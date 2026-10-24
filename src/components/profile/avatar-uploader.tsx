"use client"

import { Camera, Loader2, Trash2 } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { useRemoveAvatar, useUploadAvatar } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"

const SIZE = 256

/**
 * Center-crops any photo to a 256 px square WebP in the browser before upload, so
 * the server only ever stores small images (and a huge phone photo never leaves the device).
 */
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement("canvas")
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86))
  // Browsers without WebP encoding fall back to JPEG.
  return blob ?? new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.88))
}

export function AvatarUploader({ name, src }: { name: string; src: string | null }) {
  const { d } = useI18n()
  const t = d.profile
  const input = useRef<HTMLInputElement>(null)
  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()
  const busy = upload.isPending || remove.isPending

  const onFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error(t.photoType)
      return
    }
    try {
      const image = await toSquareWebp(file)
      upload.mutate(image, {
        onSuccess: () => toast.success(t.photoSaved),
        onError: (error) => toast.error(localizeError(error, d.errors)),
      })
    } catch {
      toast.error(t.photoType)
    } finally {
      if (input.current) input.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <UserAvatar name={name} src={src} tone="teal" className="size-24 text-2xl" />
        {busy && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-background/60">
            <Loader2 className="size-6 animate-spin text-primary" />
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <p className="font-medium">{t.photoTitle}</p>
        <p className="text-sm text-muted-foreground">{t.photoHint}</p>
        <div className="flex flex-wrap gap-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="avatar-input" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
            <Camera />
            {src ? t.photoChange : t.photoUpload}
          </Button>
          {src && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              className="text-muted-foreground hover:text-destructive"
              onClick={() => remove.mutate(undefined, { onSuccess: () => toast.success(t.photoRemoved) })}
            >
              <Trash2 />
              {t.photoRemove}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
