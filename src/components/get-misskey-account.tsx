"use client"

import { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import { misskeyAccountFetcher } from "@/utils/misskey/account-fetcher"
import { misskeyMetaFetcher } from "@/utils/misskey/meta-fetcher"

type Props = {
    children?: ReactNode
    userid: string
    isNSFW?: boolean
    host: string
}

export default function GetMisskeyAccount(progs: Props) {
    const {
        data: accountData,
        error: accountError,
        isLoading: isAccountLoading,
    } = useSWR(
        {
            host: progs.host,
            userid: progs.userid,
        },
        misskeyAccountFetcher
    )

    const {
        data: metaData,
        error: metaError,
        isLoading: isMetaLoading,
    } = useSWR({ host: progs.host }, misskeyMetaFetcher)

    if (isAccountLoading && isMetaLoading)
        return (
            <>
                {" "}
                <li className="card w-auto bg-base-300 shadow-xl">
                    <figure></figure>
                    <div className="card-body">
                        <div className="card-title text-center">
                            <p>Feching Account and Meta...</p>
                        </div>
                        <p className="text-red-300 hover:text-red-500">
                            at {progs.host}
                        </p>
                    </div>
                </li>
            </>
        )

    if (accountError || metaError)
        return (
            <>
                <li className="card w-auto bg-base-300 shadow-xl">
                    <figure></figure>
                    <div className="card-body">
                        <div className="card-title text-center">
                            <h2>{"can't get name"}</h2>
                        </div>

                        <p className="text-red-300 hover:text-red-500">
                            {"@can't get id"}@{progs.host}
                        </p>

                        <p className="whitespace-pre-wrap">
                            can&apos;t get description
                        </p>
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
                        <h2>{accountData?.name || "no name"}</h2>
                    </div>

                    <Link
                        href={`https://${progs.host}/@${progs.userid}`}
                        className="text-green-300 hover:text-green-500"
                        target="_blank"
                    >
                        @{accountData?.username}@{progs.host}
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
                        {accountData?.description || "no description"}
                    </p>

                    <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />

                    <ul className="flex">
                        <li className="text-center px-1">
                            <p className="text-stone-500">Notes</p>
                            <p className="text-2xl">
                                {accountData?.notesCount}
                            </p>
                        </li>
                        <li className="text-center px-1">
                            <p className="text-stone-500">Following</p>
                            <p className="text-2xl">
                                {accountData?.followingCount}
                            </p>
                        </li>
                        <li className="text-center px-1">
                            <p className="text-stone-500">Followers</p>
                            <p className="text-2xl">
                                {accountData?.followersCount}
                            </p>
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
                        <div className="text-stone-300 text-sm">
                            <p>
                                Server:{" "}
                                <Link
                                    href={`https://${progs.host}`}
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

                            <p>Version: {metaData?.version}</p>
                        </div>
                    </div>
                </div>
            </li>
        </>
    )
}
