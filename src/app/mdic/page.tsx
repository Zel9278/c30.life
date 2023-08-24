"use client"

import Head from "next/head"
import Image from "next/image"
import React, { useState } from "react"
import Link from "next/link"

export default function Home() {
    const [id, setId] = useState("")
    const [url, setUrl] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [isAfterAddress, setAfterAddress] = useState(true)
    const [isAddAtMark, setAddAtMark] = useState(false)

    const onIdChange = (event: React.ChangeEvent<HTMLInputElement>): void =>
        setId(event.target.value)
    const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void =>
        setUrl(event.target.value)
    const onButtonClick = (): void =>
        setImageUrl(
            `https://${url}/identicon/${isAddAtMark ? "@" + id : id}${
                isAfterAddress ? "@" + url : ""
            }`
        )
    const onIsAfterAddressClick = (): void => setAfterAddress(!isAfterAddress)
    const onIsAddAtMarkClick = (): void => setAddAtMark(!isAddAtMark)

    return (
        <>
            <Head>
                <title>c30 life - Misskey Default Icon Checker</title>
                <meta
                    name="description"
                    content="Misskeyのデフォルトアイコンを確認できるページです。"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta
                    property="og:title"
                    content="c30 life - Misskey Default Icon Checker"
                />
                <meta property="og:locale" content="ja_JP" />
                <meta property="og:site_name" content="c30 life" />
                <meta property="og:type" content="homepage" />
                <meta
                    property="og:description"
                    content="Misskeyのデフォルトアイコンを確認できるページです。"
                />
                <meta
                    property="og:image"
                    content="https://c30.life/c30_rounded.png"
                />
                <meta property="og:url" content="https://c30.life/mdic" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className="card w-auto bg-base-300 shadow-xl m-2">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">使い方 & 注意</h2>
                        <div className="alert alert-info shadow-lg p-3">
                            <div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="stroke-current flex-shrink-0 w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                                <span>
                                    Misskeyのidを上の入力欄に、サーバーのURL(https://無し)を下の欄に入力し、「実行」を押すだけ
                                </span>
                            </div>
                        </div>
                        <div className="alert alert-warning shadow-lg p-3">
                            <div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-current flex-shrink-0 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <span>
                                    idに大文字が入ってる方は小文字で入力してください(例:
                                    Asdf1234 -&gt; asdf1234)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />
                <div className="flex flex-col items-center">
                    <p>ID</p>
                    <input
                        type="text"
                        className="input input-bordered input-success w-full max-w-xs m-2"
                        placeholder="例: c30"
                        value={id}
                        onChange={onIdChange}
                    />
                    <p>URL</p>
                    <input
                        type="text"
                        className="input input-bordered input-success w-full max-w-xs m-2"
                        placeholder="例: misskey.art"
                        value={url}
                        onChange={onUrlChange}
                    />
                    <button
                        type="submit"
                        className="btn btn-accent w-52"
                        onClick={onButtonClick}
                    >
                        実行
                    </button>
                    <Link href={imageUrl} target="_blank">
                        {imageUrl}
                    </Link>
                    <div
                        className="border m-2"
                        style={{
                            width: 128,
                            height: 128,
                        }}
                    >
                        <Image
                            src={imageUrl}
                            width={128}
                            height={128}
                            alt="Default Icon"
                        />
                    </div>
                </div>
                <div className="bg-zinc-800 w-full h-0.5 rounded my-2" />
                <div className="card w-auto bg-base-300 shadow-xl m-2">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">オプション</h2>
                        <div className="form-control">
                            <label className="cursor-pointer label p-0">
                                <span className="label-text px-2">
                                    IDの前に@を追加する
                                </span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={isAddAtMark}
                                    onClick={onIsAddAtMarkClick}
                                />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="cursor-pointer label p-0">
                                <span className="label-text px-2">
                                    IDの最後にアドレスを追加する
                                </span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={isAfterAddress}
                                    onClick={onIsAfterAddressClick}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
