import NavBar from "@/components/navbar"
import "@/styles/globals.css"
import Footer from "@/components/footer"
import type { Metadata, Viewport } from "next"
import Drawer from "@/components/drawer"
import Fireworks from "@/components/fireworks"
import { ThemeProvider } from "next-themes"

const siteName = "c30 life"
const description = "c30のホームページです。"
const url = "https://c30.life"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="h-screen w-screen flex flex-col">
        <ThemeProvider storageKey="theme" themes={["forest", "cupcake"]}>
          <Drawer>
            {process.env.npm_lifecycle_event === "dev" && (
              <div className="fixed bottom-0 right-0 z-50 p-2 bg-black">
                <p className="text-xl text-red-600 animate-bounce">
                  Debug Build
                </p>
              </div>
            )}
            <NavBar />
            <main className="flex-grow overflow-y-auto">{children}</main>
            <Fireworks />
            <a
              rel="me"
              href="https://fedibird.com/@c30"
              style={{ display: "none" }}
            >
              Fedibird
            </a>
            <a
              rel="me"
              href="https://misskey.art/@c30"
              style={{ display: "none" }}
            >
              Misskey.art
            </a>
            <a
              rel="me"
              href="https://mk.c30.life/@c30"
              style={{ display: "none" }}
            >
              至り来たり宿
            </a>
            <Footer />
          </Drawer>
        </ThemeProvider>
      </body>
    </html>
  )
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(url),
    title: {
      default: siteName,
      template: `%s - ${siteName}`,
    },
    description,
    openGraph: {
      images: "/c30_rounded.png",
      url,
      type: "website",
      siteName,
      title: {
        default: siteName,
        template: `%s - ${siteName}`,
      },
    },
    twitter: {
      card: "summary",
      title: siteName,
      description,
      site: "@c30_eo",
      creator: "@c30_eo",
      images: "/c30_rounded.png",
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}
