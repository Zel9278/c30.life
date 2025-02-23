import type { Metadata } from "next"

const urlBase = "https://c30.life"

export function generate(
  title: string,
  description: string,
  url: string,
  opt?: Metadata,
): Metadata {
  const data = {
    metadataBase: new URL(urlBase),
    title,
    description,
    openGraph: {
      images: `${urlBase}/c30_rounded.png`,
      url,
      type: "website",
      siteName: "c30 life",
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: "@c30_eo",
      creator: "@c30_eo",
      images: `${urlBase}/c30_rounded.png`,
    },
  }

  return Object.assign(data, opt)
}
