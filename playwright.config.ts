import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:3210", trace: "retain-on-failure" },
  webServer: { command: "pnpm.cmd dev --hostname 127.0.0.1 --port 3210", url: "http://127.0.0.1:3210", reuseExistingServer: true, timeout: 120_000 },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
