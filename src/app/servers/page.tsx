import { Metadata } from "next"
import Link from "next/link"

type Status = "gone" | "retired" | "active"
type Softwares =
    | "Misskey"
    | "Akkoma"
    | "Calckey"
    | "Dolphin"
    | "GotoSocial"
    | "Mastodon"
    | "Simkey"
    | "Firefish"

type Server = {
    name: string
    url: string
    software: Softwares
    created_at: string
    status: Status
}

const serverStatus: { [key in Status]: string } = {
    gone: "text-red-500",
    retired: "text-yellow-500",
    active: "text-green-500",
}

const softwares: { [key in Softwares]: string } = {
    Misskey: "https://github.com/misskey-dev/misskey",
    Akkoma: "https://akkoma.dev/AkkomaGang/akkoma",
    Calckey: "https://codeberg.org/calckey/calckey",
    Dolphin: "https://github.com/misskey-dev/dolphin",
    GotoSocial: "https://github.com/superseriousbusiness/gotosocial",
    Mastodon: "https://github.com/mastodon/mastodon",
    Simkey: "https://github.com/sim1222/misskey",
    Firefish: "https://git.joinfirefish.org/firefish/firefish.git",
}

const bigServers: Server[] = [
    {
        name: "Misskeyをしよう",
        url: "https://mi-wo.site",
        software: "Misskey",
        created_at: "2022-12-24",
        status: "active",
    },
    {
        name: "Misskey.art",
        url: "https://misskey.art",
        software: "Misskey",
        created_at: "2023-02-06",
        status: "retired",
    },
]

const privateServers: Server[] = [
    {
        name: "せどすきー",
        url: "https://m.c30.life",
        software: "Misskey",
        created_at: "2023-03-30",
        status: "gone",
    },
    {
        name: "せどこま",
        url: "https://a.c30.life",
        software: "Akkoma",
        created_at: "2023-05-27",
        status: "gone",
    },
    {
        name: "せどくっきー",
        url: "https://ck.c30.life",
        software: "Calckey",
        created_at: "2023-05-28",
        status: "gone",
    },
    {
        name: "せどぴん",
        url: "https://d.c30.life",
        software: "Dolphin",
        created_at: "2023-05-31",
        status: "gone",
    },
    {
        name: "GS30",
        url: "https://gs.c30.life",
        software: "GotoSocial",
        created_at: "2023-06-09",
        status: "gone",
    },
    {
        name: "せどん",
        url: "https://md.c30.life",
        software: "Mastodon",
        created_at: "2023-06-10",
        status: "gone",
    },
    {
        name: "せしむ",
        url: "https://sk.c30.life",
        software: "Simkey",
        created_at: "2023-06-10",
        status: "gone",
    },
    {
        name: "木月",
        url: "https://kizzkey.cloud",
        software: "Firefish",
        created_at: "2023-07-09",
        status: "active",
    },
]

export default function Home() {
    return (
        <>
            <main>
                <div>
                    <p className="text-red-500">Gone済み</p>
                    <p className="text-yellow-500">辞退済み</p>
                    <p className="text-green-500">稼働中</p>
                </div>
                <table className="border-collapse text-center">
                    <tr>
                        <th className="border border-stone-300 border-solid px-1.5">
                            名前
                        </th>
                        <th className="border border-stone-300 border-solid px-1.5">
                            URL
                        </th>
                        <th className="border border-stone-300 border-solid px-1.5">
                            ソフトウェア
                        </th>
                        <th className="border border-stone-300 border-solid px-1.5">
                            作成日
                        </th>
                    </tr>
                    <tr>
                        <th>大型鯖</th>
                    </tr>
                    {bigServers.map((server, i) => (
                        <tr key={i}>
                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                {server.name}
                            </td>

                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                <Link
                                    href={server.url}
                                    className="underline"
                                    target="_blank"
                                >
                                    {server.url}
                                </Link>
                            </td>
                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                <Link
                                    href={softwares[server.software]}
                                    className="underline"
                                    target="_blank"
                                >
                                    {server.software}
                                </Link>
                            </td>
                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                {server.created_at}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <th>個人鯖</th>
                    </tr>
                    {privateServers.map((server, i) => (
                        <tr key={i}>
                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                {server.name}
                            </td>
                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                <Link
                                    href={server.url}
                                    className="underline"
                                    target="_blank"
                                >
                                    {server.url}
                                </Link>
                            </td>
                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                <Link
                                    href={softwares[server.software]}
                                    className="underline"
                                    target="_blank"
                                >
                                    {server.software}
                                </Link>
                            </td>
                            <td
                                className={`border border-stone-300 border-solid px-1.5 ${
                                    serverStatus[server.status]
                                }`}
                            >
                                {server.created_at}
                            </td>
                        </tr>
                    ))}
                </table>
            </main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30のサーバーリストです。",
        openGraph: {
            title: "My Fediverse Servers - c30 life",
            description: "c30のサーバーリストです。",
            url: "https://c30.life/servers",
        },
    }
}
