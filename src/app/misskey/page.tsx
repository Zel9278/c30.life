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
        host: "misskey.io",
        userId: "c30_eo",
    },
    {
        host: "kizzkey.cloud",
        userId: "c30",
    },
    {
        host: "mi-wo.site",
        userId: "c30",
    },
    {
        host: "ab62.icu",
        userId: "c30",
    },
]

const users: UserData[] = [
    {
        host: "soukun.xyz",
        userId: "c30",
        isNSFW: true,
    },
    {
        host: "premis.one",
        userId: "c30",
    },
    {
        host: "ddoskey.com",
        userId: "c30",
    },
    {
        host: "9ineverse.com",
        userId: "c30",
    },
    {
        host: "nijimiss.moe",
        userId: "c30",
    },
    {
        host: "otoskey.tarbin.net",
        userId: "c30",
    },
    {
        host: "novelskey.tarbin.net",
        userId: "c30",
    },
    {
        host: "mk.absturztau.be",
        userId: "c30",
    },
    {
        host: "otofu.uk",
        userId: "c30",
    },
    {
        host: "mattyaski.co",
        userId: "l",
    },
    {
        host: "kokt.club",
        userId: "c30",
    },
    {
        host: "kokuzei.cyou",
        userId: "c30",
    },
    {
        host: "nekomiya.net",
        userId: "c30",
    },
    {
        host: "minazukey.uk",
        userId: "c30",
    },
    {
        host: "misskey.7ka.org",
        userId: "c30",
    },
    {
        host: "misskey.backspace.fm",
        userId: "c30",
    },
    {
        host: "mk.shrimpia.network",
        userId: "c30",
    },
    {
        host: "misskey.m544.net",
        userId: "c30",
    },
    {
        host: "misskey.04.si",
        userId: "c30",
    },
    {
        host: "submarin.online",
        userId: "c30",
    },
    {
        host: "p1.a9z.dev",
        userId: "ez",
    },
    {
        host: "mi.cbrx.io",
        userId: "c30",
    },
    {
        host: "sushi.ski",
        userId: "c30",
    },
    {
        host: "misskey.life",
        userId: "c30",
    },
    {
        host: "mk.shumihub.net",
        userId: "c30",
    },
    {
        host: "misskey.noellabo.jp",
        userId: "c30",
    },
    {
        host: "voskey.icalo.net",
        userId: "c30",
    },
    {
        host: "misskey.yukineko.me",
        userId: "c30",
    },
    {
        host: "misskey.kindworld.one",
        userId: "c30",
    },
    {
        host: "misskey.io",
        userId: "c30",
    },
    {
        host: "misskey.cloud",
        userId: "c30",
    },
    {
        host: "misskey.gg",
        userId: "c30",
    },
    {
        host: "misskey.design",
        userId: "c30",
    },
    {
        host: "misskey.art",
        userId: "c30",
    },
]

export default function Home() {
    return (
        <>
            <main>
                <div className="text-center">
                    <p>
                        c30が入ってるサーバーの数:{" "}
                        {mainUsedUsers.length + users.length}
                    </p>
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
                <div className="bg-zinc-800 w-full h-0.5 rounded mt-4 mb-4" />
                <h1 className="text-center">その他のアカウント</h1>
                <ul className={styles["card-container"]}>
                    {users.map((user, i) => {
                        return (
                            <GetMisskeyAccount
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
        description: "c30のMisskeyのアカウントリストです。",
        openGraph: {
            title: "misskey - c30 life",
            description: "c30のMisskeyのアカウントリストです。",
            url: "https://c30.life/misskey",
        },
    }
}
