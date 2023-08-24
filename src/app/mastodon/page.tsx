import GetMastodonAccount from "@/components/get-mastodon-account"
import styles from "@/styles/Misskey.module.css"
import { Metadata } from "next"

type UserData = {
    host: string
    userId: string
    isNSFW?: boolean
}

const users: UserData[] = [
    {
        host: "fedibird.com",
        userId: "c30",
    },
    {
        host: "mstdn.jp",
        userId: "clive64",
    },
    {
        host: "mastodon.art",
        userId: "c30",
    },
    {
        host: "blob.cat",
        userId: "c30",
    },
    {
        host: "fedi.absturztau.be",
        userId: "c30",
    },
]

export default function Home() {
    return (
        <>
            <main>
                <div className="text-center">
                    <p>c30が入ってるサーバーの数: {users.length}</p>
                </div>
                <div className="bg-zinc-800 w-full h-0.5 rounded mt-4 mb-4" />
                <h1 className="text-center">アカウント</h1>
                <ul className={styles["card-container"]}>
                    {users.map((user, i) => {
                        return (
                            <GetMastodonAccount
                                host={user.host}
                                userid={user.userId}
                                isNSFW={user.isNSFW}
                                key={i}
                            />
                        )
                    })}
                </ul>
            </main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30のMastodon, Pleroma, Akkomaのアカウントリストです。",
        openGraph: {
            title: "mastodon - c30 life",
            description:
                "c30のMastodon, Pleroma, Akkomaのアカウントリストです。",
            url: "https://c30.life/mastodon",
        },
    }
}
