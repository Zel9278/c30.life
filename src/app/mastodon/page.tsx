import GetMastodonAccount from "@/components/get-mastodon-account"
import styles from "@/styles/Misskey.module.css"
import type { Metadata } from "next"

type UserData = {
  host: string
  userId: string
  isNSFW?: boolean
  isPleroma?: boolean
}

const mastodonUsers: UserData[] = [
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
]

const pleromaUsers: UserData[] = [
  {
    host: "blob.cat",
    userId: "c30",
    isPleroma: true,
  },
  {
    host: "fedi.absturztau.be",
    userId: "c30",
    isPleroma: true,
  },
  {
    host: "post.syobon.net",
    userId: "c30",
    isPleroma: true,
  },
]

export default function Home() {
  return (
    <>
      <div className="text-center">
        <p>
          c30が入ってるサーバーの数:{" "}
          {mastodonUsers.length + pleromaUsers.length}
        </p>
      </div>
      <div className="bg-zinc-800 w-full h-0.5 rounded mt-4 mb-4" />
      <h1 className="text-center">Mastodonのアカウント</h1>
      <ul className={styles["card-container"]}>
        {mastodonUsers.map((user, i) => {
          return (
            <GetMastodonAccount
              host={user.host}
              userid={user.userId}
              isNSFW={user.isNSFW}
              isPleroma={user.isPleroma}
              key={user.host + user.userId}
            />
          )
        })}
      </ul>
      <div className="bg-zinc-800 w-full h-0.5 rounded mt-4 mb-4" />
      <h1 className="text-center">Pleroma / Akkomaのアカウント</h1>
      <ul className={styles["card-container"]}>
        {pleromaUsers.map((user, i) => {
          return (
            <GetMastodonAccount
              host={user.host}
              userid={user.userId}
              isNSFW={user.isNSFW}
              isPleroma={user.isPleroma}
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
    description: "c30のMastodon, Pleroma, Akkomaのアカウントリストです。",
    openGraph: {
      title: "mastodon",
      description: "c30のMastodon, Pleroma, Akkomaのアカウントリストです。",
      url: "https://c30.life/mastodon",
    },
  }
}
