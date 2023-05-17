import Head from "next/head"
import NavBar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Home() {
    return (
        <>
            <Head>
                <title>c30 life - Status</title>
                <meta
                    name="description"
                    content="c30のサイトなどの稼働状況です。"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta property="og:title" content="c30 life" />
                <meta property="og:locale" content="ja_JP" />
                <meta property="og:site_name" content="c30 life" />
                <meta property="og:type" content="homepage" />
                <meta
                    property="og:description"
                    content="c30のサイトなどの稼働状況です。"
                />
                <meta
                    property="og:image"
                    content="https://c30.life/c30_rounded.png"
                />
                <meta property="og:url" content="https://c30.life/status" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
            <main></main>
            <Footer />
        </>
    )
}
