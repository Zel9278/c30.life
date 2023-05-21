import NavBar from "@/components/navbar"
import "@/styles/globals.css"
import Footer from "@/components/footer"
import { Metadata } from "next"

const siteName = "c30 life"
const description = "c30のホームページです。"
const url = "https://c30.life"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ja">
            <body>
                <NavBar />
                {children}
                <Footer />
            </body>
        </html>
    )
}

export function generateMetadata(): Metadata {
    return {
        title: {
            default: siteName,
            template: `%s - ${siteName}`,
        },
        description,
        viewport: "width=device-width, initial-scale=1",
        openGraph: {
            title: siteName,
            description,
            locale: "ja_JP",
            siteName,
            url,
            images: `${url}/c30_rounded.png`,
        },
        twitter: {
            card: "summary",
            title: siteName,
            description,
            site: "@c30_eo",
            creator: "@c30_eo",
        },
    }
}
