import { expect, type Page } from "@playwright/test"

export const ACCOUNTS = {
  admin: { email: "admin@doctortracker.com", password: "Admin@12345", home: "/en/admin" },
  doctor: { email: "doctor@doctortracker.com", password: "Doctor@12345", home: "/en/doctor" },
  patient: { email: "patient@doctortracker.com", password: "Patient@12345", home: "/en/account" },
} as const

export type Role = keyof typeof ACCOUNTS

/** Signs in on the shared login page and waits until the role's area (or `next`) loads. */
export async function signIn(page: Page, role: Role, next?: string) {
  const account = ACCOUNTS[role]
  if (!page.url().includes("/login")) {
    await page.goto(next ? `/en/login?next=${encodeURIComponent(next)}` : "/en/login")
  }
  await page.locator("#email").fill(account.email)
  await page.locator("#password").fill(account.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.endsWith("/login"))
}

/** Profile URL of the seeded demo doctor. */
export async function demoDoctorPath(page: Page) {
  await page.goto("/en/doctors?search=ayesha")
  const link = page.getByRole("link", { name: "Dr. Ayesha Rahman" }).first()
  await expect(link).toBeVisible()
  return (await link.getAttribute("href"))!
}
