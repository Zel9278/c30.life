import Head from "next/head"
import Link from "next/link"

export default function Home() {
    return (
        <>
            <Head>
                <title>c30 life - Links</title>
                <meta name="description" content="c30のリンク集です。" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta property="og:title" content="c30 life - Links" />
                <meta property="og:locale" content="ja_JP" />
                <meta property="og:site_name" content="c30 life" />
                <meta property="og:type" content="homepage" />
                <meta property="og:description" content="c30のリンク集です。" />
                <meta
                    property="og:image"
                    content="https://c30.life/c30_rounded.png"
                />
                <meta property="og:url" content="https://c30.life/links" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className="card w-auto bg-base-300 shadow-xl m-5">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">リンク集</h2>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />

                        <h2 className="text-stone-400">Social</h2>

                        <ul className="flex flex-wrap text-center">
                            <li className="p-0.5">
                                <Link
                                    href="/misskey"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Misskey Accounts
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://twitter.com/c30_eo"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Twitter
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://fedibird.com/@c30"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Fedibird
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://github.com/zel9278"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Github
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://www.youtube.com/@cedmidiark"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Youtube(archive)
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://www.nicovideo.jp/user/40069987"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Niconico
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://www.pixiv.net/users/71067167"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Pixiv
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://keyoxide.org/E722127605C973DFD9A4629824A483BAC7ED3A0D"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Keyoxide
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://discord.gg/m5X4u2qWgZ"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Discord
                                </Link>
                            </li>
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />

                        <h2 className="text-stone-400">Other My Sites</h2>

                        <ul className="flex flex-wrap text-center">
                            <li className="p-0.5">
                                <Link
                                    href="https://csys64.com"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Old Homepage
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://kusoda.net"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    kusoda.net(クソだね)
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://pc-stats.eov2.com"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    PC Status
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://pdays.eov2.com"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Progress Bar for Days Web
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </>
    )
}
