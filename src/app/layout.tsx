import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Public_Sans } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"], display: "swap" })
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: { default: "Doctor Tracker", template: "%s · Doctor Tracker" },
  description: "Manage doctors, their patients and caseload analytics in one secure admin portal.",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1c29" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${publicSans.variable} ${bricolage.variable} antialiased`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
