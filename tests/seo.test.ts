import { describe, expect, it } from "vitest"

import manifest from "@/app/manifest"
import robots from "@/app/robots"
import sitemap from "@/app/sitemap"
import { createPageMetadata, siteConfig } from "@/lib/seo"

describe("SEO metadata", () => {
  it("creates canonical, social, and index directives for public pages", () => {
    const metadata = createPageMetadata({
      title: "Guide",
      description: "CipherPix guide",
      path: "/guide",
    })
    expect(metadata.alternates).toEqual({ canonical: "/guide" })
    expect(metadata.openGraph).toMatchObject({ url: "/guide", siteName: "CipherPix" })
    expect(metadata.robots).toMatchObject({ index: true, follow: true })
  })

  it("prevents temporary pages from being indexed", () => {
    const metadata = createPageMetadata({
      title: "Result",
      description: "Temporary result",
      path: "/encrypt/result",
      canonicalPath: "/encrypt",
      index: false,
    })
    expect(metadata.alternates).toEqual({ canonical: "/encrypt" })
    expect(metadata.robots).toMatchObject({ index: false, follow: false, noarchive: true })
  })

  it("publishes only indexable routes in the sitemap", () => {
    const entries = sitemap()
    expect(entries.some((entry) => entry.url.endsWith("/algorithms"))).toBe(true)
    expect(entries.some((entry) => entry.url.includes("/result"))).toBe(false)
    expect(entries.every((entry) => entry.url.startsWith(siteConfig.url.origin))).toBe(true)
  })

  it("disallows private workflow routes and provides app metadata", () => {
    expect(robots().rules).toMatchObject({ disallow: expect.arrayContaining(["/encrypt/result", "/settings"]) })
    expect(manifest()).toMatchObject({ name: expect.stringContaining("CipherPix"), start_url: "/" })
  })
})
