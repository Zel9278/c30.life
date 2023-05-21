import NavBar from "@/components/navbar"
import "@/styles/globals.css"
import Footer from "@/components/footer"

export const metadata = {
    title: "c30 life",
    description: "c30のホームページです。",
}

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
