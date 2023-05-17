import Footer from "@/components/footer"
import NavBar from "@/components/navbar"
import GetMisskeyAccount from "@/components/get-misskey-account"
import styles from "@/styles/Misskey.module.css"
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
            <Head>
                <title>c30 life - Misskey Links</title>
                <meta
                    name="description"
                    content="c30のMisskeyのアカウントリストです。"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta property="og:title" content="c30 life - Misskey Links" />
                <meta property="og:locale" content="ja_JP" />
                <meta property="og:site_name" content="c30 life" />
                <meta property="og:type" content="homepage" />
                <meta
                    property="og:description"
                    content="c30のMisskeyのアカウントリストです。"
                />
                <meta
                    property="og:image"
                    content="https://c30.life/c30_rounded.png"
                />
                <meta property="og:url" content="https://c30.life/misskey" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
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
            <Footer />
        </>
    )
}
