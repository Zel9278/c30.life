import { Metadata } from "next"
import Link from "next/link"
import os from "os"
import packages from "../../../package.json"

type Package = {
    name: string
    version: string
}

type Dependencies = {
    [key: string]: string
}

const getData = async () => {
    return {
        host: "c30.life",
        owner: "c30",
        hostname: os.hostname(),
        runningAs: `${os.userInfo().username}@${os.hostname()}`,
        thisVersion: packages.version,
        nodeVersion: process.version,
        pnpmVersion: packages.packageManager,
    }
}

export default async function Home() {
    let data = await getData()

    const deps: Dependencies = packages.dependencies
    const devDeps: Dependencies = packages.devDependencies

    const packageList: Package[] = []
    const devPackageList: Package[] = []

    for (const [name, version] of Object.entries(deps)) {
        packageList.push({ name, version })
    }

    for (const [name, version] of Object.entries(devDeps)) {
        devPackageList.push({ name, version })
    }

    return (
        <>
            <main>
                <div className="card w-full bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Info</h2>
                        <div className="bg-zinc-400 w-full h-0.5 rounded" />
                        <ul className="px-5">
                            <li>ホスト: {data.host}</li>
                            <li>オーナー: {data.owner}</li>
                            <li>実行ユーザー: {data.runningAs}</li>
                            <li className="bg-zinc-500 w-full h-0.5 rounded my-1" />
                            <li>このサイトバージョン: {data.thisVersion}</li>
                            <li>Node.jsのバージョン: {data.nodeVersion}</li>
                            <li>
                                pnpmのバージョン:{" "}
                                {data.pnpmVersion.replace("pnpm@", "")}
                            </li>
                            <li className="bg-zinc-500 w-full h-0.5 rounded my-1" />
                            <li>
                                Sitemap:{" "}
                                <Link
                                    href="/sitemap.xml"
                                    className="link link-primary"
                                    target="_blank"
                                >
                                    sitemap.xml
                                </Link>
                            </li>
                            <li>
                                Robots:{" "}
                                <Link
                                    href="/robots.txt"
                                    className="link link-primary"
                                    target="_blank"
                                >
                                    robots.txt
                                </Link>
                            </li>
                            <li>
                                Repository:{" "}
                                <Link
                                    href="https://github.com/Zel9278/c30.life"
                                    className="link link-primary"
                                    target="_blank"
                                >
                                    git:zel9278/c30.life
                                </Link>
                            </li>
                        </ul>

                        <div className="bg-zinc-400 w-full h-0.5 rounded my-2" />

                        <details className="collapse collapse-arrow bg-base-200">
                            <summary className="collapse-title text-xl font-medium">
                                Dependencies
                            </summary>
                            <div className="collapse-content max-h-full">
                                <ul>
                                    {packageList.map((pkg, i) => (
                                        <li key={i}>
                                            {pkg.name}: {pkg.version}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </details>
                        <details className="collapse collapse-arrow bg-base-200">
                            <summary className="collapse-title text-xl font-medium">
                                DevDependencies
                            </summary>
                            <div className="collapse-content max-h-full">
                                <ul>
                                    {devPackageList.map((pkg, i) => (
                                        <li key={i}>
                                            {pkg.name}: {pkg.version}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </details>
                    </div>
                </div>
            </main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30.lifeの情報です。",
        openGraph: {
            title: "info",
            description: "c30.lifeの情報です。",
            url: "https://c30.life/info",
        },
    }
}
