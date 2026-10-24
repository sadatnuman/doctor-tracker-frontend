import { expect, test } from "@playwright/test"

test.describe("public site", () => {
  test("landing page renders in English and Bangla @mobile", async ({ page }) => {
    await page.goto("/en")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page.getByRole("heading", { name: "Browse by specialty" })).toBeVisible()

    await page.goto("/bn")
    await expect(page.locator("html")).toHaveAttribute("lang", "bn-BD")
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
  })

  test("paths without a language are redirected", async ({ page }) => {
    await page.goto("/doctors")
    await expect(page).toHaveURL(/\/(en|bn)\/doctors$/)
  })

  test("directory searches doctors @mobile", async ({ page }) => {
    await page.goto("/en/doctors")
    await expect(page.getByText(/Showing/)).toBeVisible()
    await page.goto("/en/doctors?search=ayesha")
    await expect(page.getByRole("link", { name: "Dr. Ayesha Rahman" }).first()).toBeVisible()
  })

  test("SEO essentials are in place", async ({ page, request }) => {
    await page.goto("/en/specialties/cardiology")
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/specialties\/cardiology$/)
    await expect(page.locator('link[rel="alternate"][hreflang="bn-BD"]')).toHaveCount(1)
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached()

    const robots = await (await request.get("/robots.txt")).text()
    expect(robots).toContain("Disallow: /en/admin")
    expect(robots).toContain("Sitemap:")
    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain("/en/doctors")
  })

  test("shared links get a large preview image", async ({ request }) => {
    // Social crawlers (LinkedIn, Facebook, WhatsApp, X) receive the metadata in the HTML head.
    const html = await (await request.get("/en", { headers: { "user-agent": "LinkedInBot/1.0" } })).text()
    const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
    expect(image).toBeTruthy()
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image"/>')

    const res = await request.get(new URL(image!).pathname)
    expect(res.ok()).toBeTruthy()
    expect(res.headers()["content-type"]).toBe("image/png")
  })
})
