"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import { mastodonAccountFetcher } from "@/utils/mastodon/account-fetcher"
import { mastodonMetaFetcher } from "@/utils/mastodon/meta-fetcher"

type Props = {
  children?: ReactNode
  userid: string
  isNSFW?: boolean
  isPleroma?: boolean
  host: string
}

export default function GetMastodonAccount(progs: Props) {
  const {
    data: accountData,
    error: accountError,
    isLoading: isAccountLoading,
  } = useSWR(
    {
      host: progs.host,
      userid: progs.userid,
    },
    mastodonAccountFetcher,
  )

  const {
    data: metaData,
    error: metaError,
    isLoading: isMetaLoading,
  } = useSWR({ host: progs.host }, mastodonMetaFetcher)

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
            <p className="text-red-300 hover:text-red-500">at {progs.host}</p>
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
              {"@can't get id"}@{progs.host}
            </p>

            <p className="whitespace-pre-wrap">can&apos;t get note</p>
          </div>
        </li>
      </>
    )

  return (
    <>
      <li
        className={
          progs.isNSFW
            ? "card w-auto bg-base-300 shadow-xl flex flex-row blur-md hover:blur-none"
            : "card w-auto bg-base-300 shadow-xl flex flex-row"
        }
      >
        <figure>
          {accountData?.avatar && (
            <Image
              src={
                `${accountData?.avatar}` ||
                "https://r2.kizzkey.cloud/files/files/13b6b81f-b054-4124-b2b0-ced6c92c904f.jpg"
              }
              alt="banner"
              height={128}
              width={128}
              className="rounded-full p-5"
            />
          )}
        </figure>
        <div className="card-body">
          <div className="card-title text-center">
            <h2>{accountData?.display_name || "no name"}</h2>
          </div>

          <Link
            href={`https://${progs.host}/${
              !progs.isPleroma ? "@" : ""
            }${progs.userid}`}
            className="text-green-300 hover:text-green-500"
            target="_blank"
          >
            @{accountData?.username}@{progs.host}
          </Link>

          <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

          <p className="whitespace-pre-wrap">
            {accountData?.note || "no note"}
          </p>

          <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

          <ul className="flex">
            <li className="text-center px-1">
              <p className="text-stone-500">Statuses</p>
              <p className="text-2xl">{accountData?.statuses_count}</p>
            </li>
            <li className="text-center px-1">
              <p className="text-stone-500">Following</p>
              <p className="text-2xl">{accountData?.following_count}</p>
            </li>
            <li className="text-center px-1">
              <p className="text-stone-500">Followers</p>
              <p className="text-2xl">{accountData?.followers_count}</p>
            </li>
          </ul>

          <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

          <div className="card w-auto bg-base-300 shadow-xl flex flex-row p-2">
            <div className="text-stone-500 text-sm">
              <p>
                Server:{" "}
                <Link
                  href={`https://${progs.host}`}
                  target="_blank"
                  className={
                    metaData?.registrations
                      ? "text-lime-500 hover:text-lime-300"
                      : "text-red-500"
                  }
                >
                  {metaData?.title}
                </Link>
              </p>

              <p>Version: {metaData?.version}</p>
            </div>
          </div>
        </div>
      </li>
    </>
  )
}
