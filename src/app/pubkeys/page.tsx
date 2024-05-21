import { Metadata } from "next"

const pubkeys = [
    {
        title: "SSH",
        content:
            "ssh-ed255 AAAAC3NzaC1lZDI1NTE5AAAAIAUPX3H1WYraFO4i9XHZPA7Mytzxjl6buDkIsvP45adw",
    },
    {
        title: "PGP",
        content: "9EF8EC1FD53DE71F282013BEC4A74B9FB980BF72",
    },
    {
        title: "Switch",
        content: "SW-2401-9682-4232",
    },
    {
        title: "Steam",
        content: "1012960934 / fuji_midi",
    },
]

export default function Home() {
    return (
        <>
            <main>
                <div className="card w-full bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Public keys</h2>
                        <div className="bg-zinc-400 w-full h-0.5 rounded" />
                        <ul>
                            {pubkeys.map((key, i) => (
                                <li key={i} className="mt-4">
                                    <h3>{key.title}</h3>
                                    <p>{key.content}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
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
