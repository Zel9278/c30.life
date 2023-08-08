import { Metadata } from "next"

type Server = {
    uri: string
    reason: string
}

const servers: Server[] = [
    {
        uri: "xxxxxxxxx.xx",
        reason: "Server administrator suspicious.",
    },
    {
        uri: "xxxxxxx.xxxx",
        reason: "Because of offensive behaviour by the server operator towards me and attacks on certain servers.",
    },
]

export default async function Home() {
    return (
        <>
            <main>
                <h1 className="text-4xl font-bold">
                    Underbar Server Block List
                </h1>
                <p className="text-lg">
                    Misskeyのサーバー「あんだーばー」のサーバーブロックリストです。
                </p>
                <p>xで隠されているのは検索回避です。</p>
                <p>
                    このブロックリストは「木月（kizzkey）」「mi-wo.site」でも適用されます。
                </p>
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th className="border border-stone-300 border-solid py-0.5">
                                サーバー
                            </th>
                            <th className="border border-stone-300 border-solid py-0.5">
                                理由
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {servers.map((server, i) => (
                            <tr key={i}>
                                <td className="border border-stone-300 border-solid py-0.5">
                                    {server.uri}
                                </td>
                                <td className="border border-stone-300 border-solid py-0.5">
                                    {server.reason}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description:
            "Misskeyのサーバー「あんだーばー」のサーバーブロックリストです。",
        openGraph: {
            title: "Underbar Server Block List - c30 life",
            description:
                "Misskeyのサーバー「あんだーばー」のサーバーブロックリストです。",
            url: "https://c30.life/underbar-server-block-list",
        },
    }
}
