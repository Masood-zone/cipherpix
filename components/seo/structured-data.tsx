import { siteConfig } from "@/lib/seo"

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  alternateName: siteConfig.fullName,
  url: siteConfig.url.toString(),
  description: siteConfig.description,
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Cryptography education",
  operatingSystem: "Any modern operating system",
  browserRequirements:
    "Requires JavaScript, Web Crypto API, Web Workers, and File API support",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: siteConfig.author.name,
    jobTitle: siteConfig.author.role,
  },
  codeRepository: siteConfig.repository,
  featureList: [
    "Local browser image encryption",
    "Caesar byte transformation",
    "Rail Fence transposition",
    "SHA-256 integrity verification",
    "CipherPix package creation and recovery",
  ],
}

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  )
}
