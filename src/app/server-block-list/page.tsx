import { Metadata } from "next"

type Server = {
    uri: string
    reason: string
}

const servers: Server[] = [
    {
        uri: "gnusocial.jp",
        reason: "Server administrator suspicious.",
    },
    {
        uri: "micolor.link",
        reason: "Because of offensive behaviour by the server operator towards me and attacks on certain servers.",
    },
    {
        uri: "prismisskey.space",
        reason: "Same reason as micolor.link",
    },
    {
        uri: "tech.lgbt",
        reason: "Trying to impose the laws of your own country despite the fact that countries have different laws from each other (an act of self-governance), and pretending that the function of NSFW does not exist despite the fact that it does, and exposing the post.",
    },
    {
        uri: "kids.0px.io",
        reason: "Servers dealing with users under the age of 13, lawless.",
    },
]

export default async function Home() {
    return (
        <>
            <main>
                <h1 className="text-4xl font-bold">Server Block List</h1>
                <p className="text-lg">
                    kizzkey.cloudのサーバーブロックリストです。
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
        description: "kizzkey.cloudのサーバーブロックリストです。",
        openGraph: {
            title: "Server Block List - c30 life",
            description: "kizzkey.cloudのサーバーブロックリストです。",
            url: "https://c30.life/server-block-list",
        },
    }
}
