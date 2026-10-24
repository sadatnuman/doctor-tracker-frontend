import { expect, test } from "@playwright/test"
import { ACCOUNTS, signIn, type Role } from "./helpers"

test.describe("route protection", () => {
  for (const area of ["/en/admin", "/en/doctor", "/en/account"]) {
    test(`visitors are sent to sign in from ${area}`, async ({ page }) => {
      await page.goto(area)
      await expect(page).toHaveURL(new RegExp(`/en/login\\?next=${encodeURIComponent(area)}`))
    })
  }

  for (const role of Object.keys(ACCOUNTS) as Role[]) {
    test(`${role} lands in their own area and is kept out of the others`, async ({ page }) => {
      await signIn(page, role)
      await expect(page).toHaveURL(new RegExp(`${ACCOUNTS[role].home}$`))

      for (const other of Object.values(ACCOUNTS).filter((a) => a.home !== ACCOUNTS[role].home)) {
        await page.goto(other.home)
        await expect(page).toHaveURL(new RegExp(`${ACCOUNTS[role].home}$`))
      }
    })
  }

  test("the API rejects requests without a session", async ({ request }) => {
    const res = await request.get("/api/patients")
    expect(res.status()).toBe(401)
  })

  test("admin navigates between dashboard, doctors and patients @mobile", async ({ page, isMobile }) => {
    await signIn(page, "admin")
    for (const [label, path] of [["Doctors", "/en/admin/doctors"], ["Patients", "/en/admin/patients"], ["Dashboard", "/en/admin"]]) {
      if (isMobile) await page.getByRole("button", { name: /toggle sidebar|menu/i }).first().click()
      await page.getByRole("link", { name: label, exact: true }).first().click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
    }
  })
})
