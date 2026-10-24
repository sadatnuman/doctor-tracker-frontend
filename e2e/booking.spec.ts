import { expect, test } from "@playwright/test"
import { demoDoctorPath, signIn } from "./helpers"

/**
 * The full patient journey: pick a slot as a visitor, sign in, hold it, survive a declined
 * card, pay by bKash, see the receipt, and cancel (refund) so the slot is free again.
 */
test("visitor books, pays and cancels an appointment", async ({ page }) => {
  const profile = await demoDoctorPath(page)
  await page.goto(profile)

  const openSlots = page.locator('[role="tabpanel"] button:not([disabled])')
  await expect(openSlots.first()).toBeVisible()
  // Retry until hydrated: the first click can land before React attaches handlers.
  await expect(async () => {
    await openSlots.first().click()
    await expect(openSlots.first()).toHaveAttribute("aria-pressed", "true", { timeout: 1000 })
  }).toPass()
  await page.getByRole("link", { name: "Sign in to book" }).click()
  await page.waitForURL(/\/en\/login\?next=.*slot/)

  // Back on the profile with the chosen slot preselected.
  await signIn(page, "patient")
  await expect(page).toHaveURL(/\/en\/doctors\/[a-f0-9]{24}\?slot=/)
  await page.locator("#booking-reason").fill("Fever and cough for three days")
  await page.getByRole("button", { name: "Continue to payment" }).click()

  // Held for five minutes while paying.
  await expect(page.getByRole("heading", { name: "Complete your payment" })).toBeVisible()
  await expect(page.getByRole("timer")).toHaveText(/\d:\d\d/)

  await page.locator("#cardholder").fill("Rafi Ahmed")
  await page.locator("#card-number").fill("4000 0000 0000 0002")
  await page.locator("#card-expiry").fill("12/30")
  await page.locator("#card-cvc").fill("123")
  await page.getByRole("button", { name: /^Pay / }).click()
  await expect(page.getByText(/Payment was declined/).first()).toBeVisible()
  await expect(page.getByRole("timer")).toBeVisible()

  await page.getByRole("radio", { name: "bKash" }).click()
  await page.locator("#wallet-number").fill("01712345678")
  await page.locator("#wallet-pin").fill("12345")
  await page.getByRole("button", { name: /^Pay / }).click()
  await expect(page.getByRole("heading", { name: "Appointment confirmed" })).toBeVisible()
  await expect(page.getByText(/TXN/).first()).toBeVisible()

  // Cancel to refund and release the slot for the next run.
  await page.getByRole("button", { name: "Cancel appointment" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel appointment" }).click()
  await expect(page.getByRole("heading", { name: "Appointment cancelled" })).toBeVisible()
})
