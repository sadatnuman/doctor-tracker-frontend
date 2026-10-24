import type { Metadata, Viewport } from "next"
import { Inter, Noto_Sans_Bengali } from "next/font/google"
import { Providers } from "@/components/providers"
import { LOCALES } from "@/i18n/config"
import { getDictionary, resolveLocale } from "@/i18n/server"
import { SITE_URL } from "@/lib/site"
import "../globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" })
// Inter has no Bengali glyphs; this face renders Bangla text. Not preloaded on English pages.
const bengali = Noto_Sans_Bengali({ variable: "--font-bengali", subsets: ["bengali"], display: "swap", preload: false })

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const d = await getDictionary(await resolveLocale(params))
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.meta.homeTitle, template: `%s · ${d.meta.siteName}` },
    description: d.meta.homeDescription,
    applicationName: d.meta.siteName,
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1c29" },
  ],
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const locale = await resolveLocale(params)
  const dictionary = await getDictionary(locale)
  return (
    <html lang={locale === "bn" ? "bn-BD" : "en"} suppressHydrationWarning className={`${inter.variable} ${bengali.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {dictionary.common.skipToContent}
        </a>
        <Providers locale={locale} dictionary={dictionary}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
