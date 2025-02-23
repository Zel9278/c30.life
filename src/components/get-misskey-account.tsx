"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import { misskeyAccountFetcher } from "@/utils/misskey/account-fetcher"
import { misskeyMetaFetcher } from "@/utils/misskey/meta-fetcher"
import { useEffect, useState } from "react"
import EmojiParser from "@/utils/emoji-parser"
import DOMPurify from "isomorphic-dompurify"
import parse from "html-react-parser"

type Props = {
  children?: ReactNode
  userid: string
  isNSFW?: boolean
  host: string
}

type Softwares =
  | "https://github.com/misskey-dev/misskey"
  | "https://codeberg.org/calckey/calckey"
  | "https://github.com/sim1222/misskey"
  | "https://git.joinfirefish.org/firefish/firefish"
  | "https://codeberg.org/firefish/firefish"
  | "https://akkoma.dev/FoundKeyGang/FoundKey"
  | "https://github.com/taiyme/misskey"
  | "no software"

const softwares: { [key in Softwares]: string } = {
  "https://github.com/misskey-dev/misskey": "Misskey",
  "https://codeberg.org/calckey/calckey": "Calckey",
  "https://github.com/sim1222/misskey": "Simkey",
  "https://git.joinfirefish.org/firefish/firefish": "Firefish",
  "https://codeberg.org/firefish/firefish": "Firefish",
  "https://akkoma.dev/FoundKeyGang/FoundKey": "FoundKey",
  "https://github.com/taiyme/misskey": "Submarin",
  "no software": "Old or Hidden Misskey Fork",
}

export default function GetMisskeyAccount({ host, userid, isNSFW }: Props) {
  const [parsedUserName, setParsedUserName] = useState<string | null>(null)
  const [parsedDescription, setParsedDescription] = useState<string | null>(
    null,
  )

  const {
    data: accountData,
    error: accountError,
    isLoading: isAccountLoading,
  } = useSWR(
    {
      host: host,
      userid: userid,
    },
    misskeyAccountFetcher,
  )

  const {
    data: metaData,
    error: metaError,
    isLoading: isMetaLoading,
  } = useSWR({ host: host }, misskeyMetaFetcher)

  useEffect(() => {
    const parseEmojis = async () => {
      const parser = new EmojiParser(host)
      const parsedName = await parser.parse(accountData?.name || "")
      const parsedDescription = await parser.parse(
        accountData?.description || "",
      )

      const name = parsedName || accountData?.name || null
      const description = parsedDescription || accountData?.description || null

      setParsedUserName(name)
      setParsedDescription(description)
    }

    parseEmojis()
  }, [host, accountData])

  if (isAccountLoading && isMetaLoading)
    return (
      <>
        {" "}
        <li className="card w-auto bg-base-300 shadow-xl">
          <figure />
          <div className="card-body">
            <div className="card-title text-center">
              <p>Feching Account and Meta...</p>
            </div>
            <p className="text-red-300 hover:text-red-500">at {host}</p>
          </div>
        </li>
      </>
    )

  if (accountError || metaError)
    return (
      <>
        <li className="card w-auto bg-base-300 shadow-xl">
          <figure />
          <div className="card-body">
            <div className="card-title text-center">
              <h2>{"can't get name"}</h2>
            </div>

            <p className="text-red-300 hover:text-red-500">
              {"@can't get id"}@{host}
            </p>

            <p className="whitespace-pre-wrap">can&apos;t get description</p>
          </div>
        </li>
      </>
    )

  const software = (metaData?.repositoryUrl || "no software") as Softwares

  return (
    <>
      <li
        className={
          isNSFW
            ? "card w-auto bg-base-300 shadow-xl flex flex-row blur-md hover:blur-none"
            : "card w-auto bg-base-300 shadow-xl flex flex-row"
        }
      >
        <figure>
          {accountData?.avatarUrl && (
            <Image
              src={`${accountData?.avatarUrl}` || "/"}
              alt="banner"
              height={128}
              width={128}
              className="rounded-full p-5"
            />
          )}
        </figure>
        <div className="card-body">
          <div className="card-title text-center">
            <h2>
              {parse(
                DOMPurify.sanitize(
                  parsedUserName || accountData?.name || "no name",
                ),
              )}
            </h2>
          </div>

          <Link
            href={`https://${host}/@${userid}`}
            className="text-green-300 hover:text-green-500"
            target="_blank"
          >
            @{accountData?.username}@{host}
          </Link>

          <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

          <ul className="flex flex-wrap">
            {accountData?.roles ? (
              accountData?.roles?.length ? (
                accountData?.roles.map((role) => (
                  <li key={role.name} className="flex">
                    <div
                      className="badge"
                      style={{
                        borderColor: role.color,
                      }}
                    >
                      {role.iconUrl && (
                        <Image
                          src={role.iconUrl}
                          alt={role.name}
                          height={16}
                          width={16}
                        />
                      )}
                      {role.name}
                    </div>
                  </li>
                ))
              ) : (
                <p>ロールなし</p>
              )
            ) : (
              <p>ロールが対応していないバージョンです。</p>
            )}
          </ul>

          <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

          <p className="whitespace-pre-wrap">
            {parse(
              DOMPurify.sanitize(
                parsedDescription ||
                  accountData?.description ||
                  "no description",
              ),
            )}
          </p>

          <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

          <ul className="flex">
            <li className="text-center px-1">
              <p className="text-stone-500">Notes</p>
              <p className="text-2xl">{accountData?.notesCount}</p>
            </li>
            <li className="text-center px-1">
              <p className="text-stone-500">Following</p>
              <p className="text-2xl">{accountData?.followingCount}</p>
            </li>
            <li className="text-center px-1">
              <p className="text-stone-500">Followers</p>
              <p className="text-2xl">{accountData?.followersCount}</p>
            </li>
          </ul>

          <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

          <div className="card w-auto bg-base-300 shadow-xl flex flex-row p-2">
            <div>
              {metaData?.iconUrl && (
                <Image
                  src={`${metaData?.iconUrl}` || "/"}
                  alt="banner"
                  height={46}
                  width={46}
                  className="mx-2"
                />
              )}
            </div>
            <div className="text-stone-500 text-sm">
              <p>
                Server:{" "}
                <Link
                  href={`https://${host}`}
                  target="_blank"
                  className={
                    metaData?.disableRegistration
                      ? "text-red-500"
                      : "text-lime-500 hover:text-lime-300"
                  }
                >
                  {metaData?.name}
                </Link>
              </p>

              <p>Software: {softwares[software] || "Other Misskey Fork"}</p>

              <p>Version: {metaData?.version}</p>
            </div>
          </div>
        </div>
      </li>
    </>
  )
}
