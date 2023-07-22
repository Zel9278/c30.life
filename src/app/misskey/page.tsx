import GetMisskeyAccount from "@/components/get-misskey-account"
import styles from "@/styles/Misskey.module.css"
import { Metadata } from "next"

type UserData = {
    host: string
    userId: string
    isNSFW?: boolean
}

const mainUsedUsers: UserData[] = [
    {
        host: "mi-wo.site",
        userId: "c30",
    },
]

export default function Home() {
    return (
        <>
            <main>
                <div className="text-center">
                    <p>c30が入ってるサーバーの数: {mainUsedUsers.length}</p>
                </div>
                <div className="bg-zinc-800 w-full h-0.5 rounded mt-4 mb-4" />
                <h1 className="text-center">アカウント</h1>
                <ul className={styles["card-container"]}>
                    {mainUsedUsers.map((user, i) => {
                        return (
                            <GetMisskeyAccount
                                host={user.host}
                                userid={user.userId}
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
        description: "c30のMisskeyのアカウントリストです。",
        openGraph: {
            title: "misskey - c30 life",
            description: "c30のMisskeyのアカウントリストです。",
            url: "https://c30.life/misskey",
        },
    }
}
