import Head from "next/head"

export default function Home() {
    return (
        <>
            <Head>
                <title>c30 life - Public Keys</title>
                <meta name="description" content="c30の公開鍵です。" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta property="og:title" content="c30 life" />
                <meta property="og:locale" content="ja_JP" />
                <meta property="og:site_name" content="c30 life" />
                <meta property="og:type" content="homepage" />
                <meta property="og:description" content="c30の公開鍵です。" />
                <meta
                    property="og:image"
                    content="https://c30.life/c30_rounded.png"
                />
                <meta property="og:url" content="https://c30.life/pubkeys" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div>
                    <h1>SSH</h1>
                    <p>
                        ssh-ed25519
                        AAAAC3NzaC1lZDI1NTE5AAAAIAUPX3H1WYraFO4i9XHZPA7Mytzxjl6buDkIsvP45adw
                    </p>
                </div>
                <div>
                    <h1>PGP</h1>
                    <p>E722127605C973DFD9A4629824A483BAC7ED3A0D</p>
                </div>
                <div>
                    <h1>Switch</h1>
                    <p>SW-2401-9682-4232</p>
                </div>
            </main>
        </>
    )
}
