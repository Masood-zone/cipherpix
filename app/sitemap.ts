import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/seo"

const routes = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/encrypt", changeFrequency: "monthly", priority: 0.9 },
  { path: "/decrypt", changeFrequency: "monthly", priority: 0.9 },
  { path: "/algorithms", changeFrequency: "monthly", priority: 0.85 },
  { path: "/security", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guide", changeFrequency: "monthly", priority: 0.75 },
  { path: "/about", changeFrequency: "yearly", priority: 0.6 },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-21T00:00:00.000Z")
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified,
    changeFrequency,
    priority,
  }))
}
