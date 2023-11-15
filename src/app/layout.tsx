import NavBar from "@/components/navbar"
import "@/styles/globals.css"
import Footer from "@/components/footer"
import { Metadata } from "next"
import Drawer from "@/components/drawer"

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
                <Drawer>
                    {children}
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
                        href="https://tro9.life/@tro"
                        style={{ display: "none" }}
                    >
                        てぃーろさば
                    </a>
                    <Footer />
                </Drawer>
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
            images: `${url}/c30_rounded.png`,
        },
    }
}
