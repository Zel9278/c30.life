import Footer from "@/components/footer"
import NavBar from "@/components/navbar"
import Head from "next/head"

export default function Home() {
    return (
        <>
            <Head>
                <title>c30 life - Music</title>
                <meta
                    name="description"
                    content="c30の曲などを置く場所です。"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta property="og:title" content="c30 life - Music" />
                <meta property="og:locale" content="ja_JP" />
                <meta property="og:site_name" content="c30 life" />
                <meta property="og:type" content="homepage" />
                <meta
                    property="og:description"
                    content="c30の曲などを置く場所です。"
                />
                <meta
                    property="og:image"
                    content="https://c30.life/c30_rounded.png"
                />
                <meta property="og:url" content="https://c30.life/music" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
            <main>
                <div className="card w-auto bg-base-300 shadow-xl m-5">
                    <div className="card-body items-center text-center"></div>
                </div>
            </main>
            <Footer />
        </>
    )
}
