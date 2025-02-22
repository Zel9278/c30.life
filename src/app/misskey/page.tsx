import GetMisskeyAccount from "@/components/get-misskey-account"
import styles from "@/styles/Misskey.module.css"
import type { Metadata } from "next"

type UserData = {
  host: string
  userId: string
  isNSFW?: boolean
}

const mainUsedUsers: UserData[] = [
  { host: "mk.c30.life", userId: "c30" },
  {
    host: "misskey.art",
    userId: "c30",
  },
]

const users: UserData[] = [
  {
    host: "soukun.io",
    userId: "c",
    isNSFW: true,
  },
  {
    host: "45sukey.net",
    userId: "c30",
    isNSFW: true,
  },
  {
    host: "ussr.rumiserver.com",
    userId: "c",
  },
  {
    host: "misskey.systems",
    userId: "c30",
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
    host: "oekakiskey.com",
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
    host: "kokt.club",
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
    host: "misskey.flowers",
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
    host: "k.lapy.link",
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
]

export default function Home() {
  return (
    <>
      <div className="text-center">
        <p>c30が入ってるサーバーの数: {mainUsedUsers.length + users.length}</p>
      </div>
      <div className="bg-zinc-800 w-full h-0.5 rounded mt-4 mb-4" />
      <h1 className="text-center">アカウント</h1>
      <ul className={styles["card-container"]}>
        {mainUsedUsers.map((user) => {
          return (
            <GetMisskeyAccount
              host={user.host}
              userid={user.userId}
              key={user.host + user.userId}
            />
          )
        })}
      </ul>
      <div className="bg-zinc-800 w-full h-0.5 rounded mt-4 mb-4" />
      <h1 className="text-center">その他のアカウント</h1>
      <ul className={styles["card-container"]}>
        {users.map((user) => {
          return (
            <GetMisskeyAccount
              host={user.host}
              userid={user.userId}
              isNSFW={user.isNSFW}
              key={user.host + user.userId}
            />
          )
        })}
      </ul>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: "c30のMisskeyのアカウントリストです。",
    openGraph: {
      title: "misskey",
      description: "c30のMisskeyのアカウントリストです。",
      url: "https://c30.life/misskey",
    },
  }
}
