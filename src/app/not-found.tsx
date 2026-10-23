import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <BrandMark className="mx-auto size-10" />
        <h1 className="mt-6 text-2xl font-semibold">This page doesn’t exist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Check the address, or head back to the dashboard.</p>
        <Button asChild className="mt-6">
          <Link href="/">Go to dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
