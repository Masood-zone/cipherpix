import type { Metadata } from "next"

const fallbackUrl = "http://localhost:3000"

function resolveSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  try {
    return new URL(configuredUrl || fallbackUrl)
  } catch {
    return new URL(fallbackUrl)
  }
}

export const siteConfig = {
  name: "CipherPix",
  fullName:
    "CipherPix: A Hybrid Image Encryption System Using Caesar Cipher and Rail Fence Algorithms",
  tagline: "Secure Every Pixel.",
  description:
    "A local, browser-based academic platform for learning image encryption with Caesar Cipher, Rail Fence transposition, SHA-256 verification, and versioned CipherPix packages.",
  url: resolveSiteUrl(),
  repository: "https://github.com/Masood-zone/cipherpix",
  author: {
    name: "Mike Coffie",
    role: "Developer and Researcher",
  },
} as const

interface PageMetadataOptions {
  title: string
  description: string
  path: `/${string}` | "/"
  index?: boolean
  canonicalPath?: `/${string}` | "/"
}

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
  canonicalPath = path,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_GH",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    robots: index
      ? { index: true, follow: true }
      : {
          index: false,
          follow: false,
          noarchive: true,
          nosnippet: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        },
  }
}
