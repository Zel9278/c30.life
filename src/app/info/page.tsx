import { Metadata } from "next"
import Link from "next/link"
import os from "os"

const getData = async () => {
    return {
        host: "c30.life",
        owner: "c30",
        runningAs: `${os.userInfo().username}@${os.hostname()}`,
        thisVersion: require("../../../package.json").version,
        nodeVersion: process.version,
        tsVersion: require("typescript/package.json").version,
        nextVersion: require("next/package.json").version,
    }
}

export default async function Home() {
    let data = await getData()

    return (
        <>
            <main>
                <ul>
                    <li>ホスト: {data.host}</li>
                    <li>オーナー: {data.owner}</li>
                    <li>実行ユーザー: {data.runningAs}</li>
                    <li>バージョン: {data.thisVersion}</li>
                    <li>Node.jsバージョン: {data.nodeVersion}</li>
                    <li>TypeScriptバージョン: {data.tsVersion}</li>
                    <li>Next.jsバージョン: {data.nextVersion}</li>
                    <li>
                        Sitemap: <Link href="/sitemap.xml" className="link link-primary" target="_blank">sitemap.xml</Link>
                    </li>
                    <li>
                        Robots: <Link href="/robots.txt" className="link link-primary" target="_blank">robots.txt</Link>
                    </li>
                    <li>
                        Repository: <Link href="https://github.com/Zel9278/c30.life" className="link link-primary" target="_blank">git:zel9278/c30.life</Link>
                    </li>
                </ul>
            </main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30.lifeの情報です。",
        openGraph: {
            title: "info - c30 life",
            description: "c30.lifeの情報です。",
            url: "https://c30.life/info",
        },
    }
}
