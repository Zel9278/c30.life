import { Metadata } from "next"

export default function Home() {
    return (
        <>
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
                    <p>9EF8EC1FD53DE71F282013BEC4A74B9FB980BF72</p>
                </div>
                <div>
                    <h1>Switch</h1>
                    <p>SW-2401-9682-4232</p>
                </div>
                <div>
                    <h1>Steam</h1>
                    <p>1012960934 / fuji_midi</p>
                </div>
            </main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30の公開鍵です。",
        openGraph: {
            title: "pubkeys - c30 life",
            description: "c30の公開鍵です。",
            url: "https://c30.life/pubkeys",
        },
    }
}
