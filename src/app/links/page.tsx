import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

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
                                    href="/mastodon"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Mastodon Accounts
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://twitter.com/fuji_ced"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Twitter
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://vrchat.com/home/user/usr_e18c90ac-ac01-434f-a10e-c96fe3deeffc"
                                    className="btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    VRChat
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
                                    href="https://keyoxide.org/9EF8EC1FD53DE71F282013BEC4A74B9FB980BF72"
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
                            <li className="p-0.5">
                                <Link
                                    href="https://er.tty7.uk"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Fediverse Emoji Count Ranking
                                </Link>
                            </li>
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />

                        <h2 className="text-stone-400">My Fediverse Server</h2>

                        <ul className="flex flex-wrap text-center">
                            <li className="p-0.5">
                                <Link
                                    href="https://misskey.art"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    Misskey.art
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link
                                    href="https://m.tty7.uk"
                                    className=" btn btn-outline btn-info"
                                    target="_blank"
                                >
                                    tty7.uk
                                </Link>
                            </li>
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />

                        <h2 className="text-stone-400">相互リンク</h2>

                        <ul className="flex flex-wrap text-center">
                            <li className="p-0.5">
                                <Link
                                    href="https://nullnyat.nca10.moe"
                                    target="_blank"
                                >
                                    <Image
                                        src="https://nullnyat.nca10.moe/nullnyat-banner.png"
                                        width="234"
                                        height="60"
                                        alt="ぬるきゃのホームページ"
                                    />
                                </Link>
                            </li>
                            <li className="p-0.5">
                                <Link href="https://miriel.net" target="_blank">
                                    <Image
                                        src="https://miriel.net/images/mirielnet.png"
                                        width="234"
                                        height="60"
                                        alt="みりえるさんのホームページ"
                                    />
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
