import { expect, test } from "@playwright/test"

const samplePng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=", "base64")

test("encrypts, downloads, imports and recovers an image locally", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Understand CipherPix Before You Begin" })).toBeVisible()
  await page.getByRole("link", { name: "Encrypt an Image" }).first().click()
  await page.locator('input[type="file"]').setInputFiles({ name: "campus.png", mimeType: "image/png", buffer: samplePng })
  await expect(page.getByText("campus.png", { exact: true })).toBeVisible()
  await page.locator("#key").fill("47")
  await page.locator("#rails").selectOption("3")
  await page.getByRole("button", { name: "Encrypt image" }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "I Have Saved Them" }).click()
  await expect(page.getByRole("heading", { name: "Your Image Has Been Encrypted" })).toBeVisible()

  const packageDownloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: /download encrypted file/i }).click()
  const packageDownload = await packageDownloadPromise
  const packagePath = await packageDownload.path()
  expect(packagePath).toBeTruthy()

  const noteDownloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: /download note/i }).click()
  const noteDownload = await noteDownloadPromise
  const notePath = await noteDownload.path()
  expect(notePath).toBeTruthy()

  await page.goto("/decrypt")
  await page.locator('input[accept*=".cpx"]').setInputFiles(packagePath!)
  await expect(page.getByText("Valid CipherPix package", { exact: false })).toBeVisible()
  await page.getByLabel("Import recovery note").setInputFiles(notePath!)
  await page.getByRole("button", { name: "Recover image" }).click()
  await expect(page.getByRole("heading", { name: "Your Image Has Been Recovered" })).toBeVisible()
  await expect(page.getByText("Integrity Verified", { exact: true }).first()).toBeVisible()

  await page.goto("/decrypt")
  await page.locator('input[accept*=".cpx"]').setInputFiles(packagePath!)
  await page.locator("#decrypt-key").fill("48")
  await page.getByRole("button", { name: "Recover image" }).click()
  await expect(page.getByRole("alert")).toContainText("does not match")
  await expect(page.getByRole("button", { name: /download recovered image/i })).toHaveCount(0)
})

test("uses an accessible mobile navigation drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.getByRole("button", { name: "Open navigation menu" }).click()
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible()
  await page.getByRole("link", { name: "Security" }).last().click()
  await expect(page.getByRole("heading", { name: "Security & Limitations" })).toBeVisible()
})
