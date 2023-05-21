import GetMisskeyAccount from "@/components/get-misskey-account"
import styles from "@/styles/Misskey.module.css"
import { Metadata } from "next"
import Head from "next/head"

type UserData = {
    host: string
    userId: string
}

const users: UserData[] = [
    {
        host: "misskey.art",
        userId: "c30",
    },
    {
        host: "misskey.io",
        userId: "c30_eo",
    },
    {
        host: "m.c30.life",
        userId: "c30",
    },
    {
        host: "mi-wo.site",
        userId: "c30",
    },
    {
        host: "premis.one",
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
        host: "nullskey.com",
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
        host: "minazukey.uk",
        userId: "c30",
    },
    {
        host: "misskey.7ka.org",
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
        host: "misskey.sda1.net",
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
        host: "misskey.io",
        userId: "c30",
    },
    {
        host: "misskey.cloud",
        userId: "c30",
    },
    {
        host: "misskey.cf",
        userId: "mg",
    },

    {
        host: "misskey.design",
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
                <ul className={styles["card-container"]}>
                    {users.map((user, i) => {
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
