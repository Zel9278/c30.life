import { Metadata } from "next"
import Link from "next/link"

export default function Home() {
    return (
        <>
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
                                    href="https://bsky.app/profile/c30.life"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Bluesky
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

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />

                        <h2 className="text-stone-400">My Fediverse Server</h2>

                        <ul className="flex flex-wrap text-center">
                            <li className="p-0.5">
                                <Link
                                    href="https://m.c30.life"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    せどすきー(Misskey)
                                </Link>
                            </li>

                            <li className="p-0.5">
                                <Link
                                    href="https://a.c30.life"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    せどこま(Akkoma)
                                </Link>
                            </li>

                            <li className="p-0.5">
                                <Link
                                    href="https://ck.c30.life"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    せどくっきー(calckey)
                                </Link>
                            </li>

                            <li className="p-0.5">
                                <Link
                                    href="https://d.c30.life"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    せどぴん(dolphin)
                                </Link>
                            </li>

                            <li className="p-0.5">
                                <Link
                                    href="https://gs.c30.life"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    GS30(gotosocial)
                                </Link>
                            </li>

                            <li className="p-0.5">
                                <Link
                                    href="https://md.c30.life"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    せどん(mastodon)
                                </Link>
                            </li>

                            <li className="p-0.5">
                                <Link
                                    href="https://sk.c30.life"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    せしむ(simkey)
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30のリンク集です。",
        openGraph: {
            title: "links - c30 life",
            description: "c30のリンク集です。",
            url: "https://c30.life/links",
        },
        twitter: {
            description: "c30のリンク集です。",
        },
    }
}
