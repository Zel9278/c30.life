import NavBar from "@/components/navbar"
import "./globals.css"
import { Inter } from "next/font/google"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

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
        <html lang="en">
            <body className={inter.className}>
                <NavBar />
                {children}
                <Footer />
            </body>
        </html>
    )
}
