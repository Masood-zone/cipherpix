import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.fullName,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fb",
    theme_color: "#0051d5",
    categories: ["education", "utilities", "security"],
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  }
}
