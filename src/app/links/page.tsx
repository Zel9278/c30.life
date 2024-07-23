import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

const contacts = [
    {
        title: "X (旧Twitter)",
        href: "https://x.com/fuji_ced",
    },
    {
        title: "Discord",
        href: "https://discord.gg/X7RrHwV4US",
    },
    {
        title: "Mail",
        href: "mailto:ced@c30.life",
    },
    {
        title: "Misskey",
        href: "https://misskey.art/@c30",
    },
]

const socialLinks = [
    {
        title: "Misskey Accounts",
        href: "/misskey",
    },
    {
        title: "Mastodon Accounts",
        href: "/mastodon",
    },
    {
        title: "VRChat",
        href: "https://vrchat.com/home/user/usr_e18c90ac-ac01-434f-a10e-c96fe3deeffc",
    },
    {
        title: "Bluesky",
        href: "https://bsky.app/profile/c30.life",
    },
    {
        title: "Github",
        href: "https://github.com/Zel9278",
    },
    {
        title: "Youtube(archive)",
        href: "https://www.youtube.com/@cedmidiark",
    },
    {
        title: "Niconico",
        href: "https://www.nicovideo.jp/user/40069987",
    },
    {
        title: "Pixiv",
        href: "https://www.pixiv.net/users/71067167",
    },
    {
        title: "Keyoxide",
        href: "https://keyoxide.org/9EF8EC1FD53DE71F282013BEC4A74B9FB980BF72",
    },
    {
        title: "Skeb",
        href: "https://skeb.jp/@c30",
    },
]

const otherSites = [
    {
        title: "Old Homepage",
        href: "https://csys64.com",
    },
    {
        title: "kusoda.net(クソだね)",
        href: "https://kusoda.net",
    },
    {
        title: "PC Status",
        href: "https://pc-stats.eov2.com",
    },
    {
        title: "Progress Bar for Days Web",
        href: "https://pdays.eov2.com",
    },
    {
        title: "Fediverse Emoji Count Ranking",
        href: "https://er.c30.life",
    },
]

const myFediverseServers = [
    {
        title: "Misskey.art",
        href: "https://misskey.art",
        image: "https://raw.githubusercontent.com/Misskey-art/Assets/main/banner/200x40.png",
        alt: "Misskey.art",
    },
    {
        title: "至り来たり宿（第二期）",
        href: "https://mk.c30.life",
        image: "https://mk.c30.life/files/2d68d53f-1316-4953-86c7-92f88e566620",
        alt: "至り来たり宿（第二期）",
    },
]

const mutualLinks = [
    {
        title: "みりえるさんのホームページ",
        href: "https://miriel.net",
        image: "https://miriel.net/images/mirielnet.png",
        alt: "みりえるさんのホームページ",
    },
    {
        title: "ぬるきゃのホームページ",
        href: "https://nullnyat.nca10.moe",
        image: "https://nullnyat.nca10.moe/nullnyat-banner.png",
        alt: "ぬるきゃのホームページ",
    },
    {
        title: "hi there (assault1892)",
        href: "https://assault1892.boats",
        image: "https://assault1892.boats/banner/assault1892.png",
        alt: "あさるとのホームページ",
    },
    {
        title: "fuck cloudflare (assault1892)",
        href: "https://assault1892.boats/fuck",
        image: "https://assault1892.boats/banner/fuckcloudflare.png",
        alt: "あさるとのホームページ",
    },
    {
        title: "デデオチャンのホームページ",
        href: "https://deryck2000.jp.eu.org/",
        image: "https://github.com/Deryck2000/deryck2000.jp.eu.org/blob/main/d_assets/banner/deryck_banner_234_60.png?raw=true",
        alt: "デデオチャンのホームページ",
    },
    {
        title: "垂紡町",
        href: "https://suiboutown.tumblr.com/",
        image: "https://files.misskey.art//fd270cc0-02e3-49ad-9351-c247f5a466a5.png",
        alt: "さんめさんのホームページ",
    },
    {
        title: "THE MAMA FLY",
        href: "https://the-mama-fly.mystrikingly.com",
        image: "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/751498/544326_194302.png",
        alt: "蛆野さんのホームページ",
    },
    {
        title: "ルート45",
        href: "http://aratamapalace.web.fc2.com",
        image: "http://aratamapalace.web.fc2.com/images/banner.png",
        alt: "ヒズさんのホームページ",
    },
]

export default function Home() {
    return (
        <>
            <main>
                <div className="card w-auto bg-base-300 shadow-xl m-5">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">リンク集</h2>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />
                        <h2 className="text-stone-400">Contacts</h2>

                        <ul className="flex flex-wrap justify-center text-center">
                            {contacts.map((link, i) => (
                                <li key={i} className="p-0.5">
                                    <Link
                                        href={link.href}
                                        className="btn btn-outline btn-info"
                                        target="_blank"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />
                        <h2 className="text-stone-400">Social</h2>

                        <ul className="flex flex-wrap justify-center text-center">
                            {socialLinks.map((link, i) => (
                                <li key={i} className="p-0.5">
                                    <Link
                                        href={link.href}
                                        className="btn btn-outline btn-info"
                                        target="_blank"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />
                        <h2 className="text-stone-400">Other My Sites</h2>

                        <ul className="flex flex-wrap justify-center text-center">
                            {otherSites.map((link, i) => (
                                <li key={i} className="p-0.5">
                                    <Link
                                        href={link.href}
                                        className="btn btn-outline btn-info"
                                        target="_blank"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />
                        <h2 className="text-stone-400">My Fediverse Server</h2>

                        <ul className="flex flex-wrap justify-center text-center">
                            {myFediverseServers.map((link, i) => (
                                <li key={i} className="p-0.5">
                                    <Link
                                        href={link.href}
                                        className="flex flex-col"
                                        target="_blank"
                                    >
                                        {link.image ? (
                                            <>
                                                <Image
                                                    src={link.image}
                                                    alt={link.alt}
                                                    width={200}
                                                    height={36}
                                                />
                                                <span className="text-sm">
                                                    {link.title}
                                                </span>
                                            </>
                                        ) : (
                                            <button className="btn btn-outline btn-info">
                                                {link.title}
                                            </button>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />
                        <h2 className="text-stone-400">相互リンク</h2>

                        <ul className="flex flex-wrap justify-center text-center">
                            {mutualLinks.map((link, i) => (
                                <li key={i} className="p-0.5">
                                    <Link
                                        href={link.href}
                                        target="_blank"
                                        className="flex flex-col"
                                    >
                                        {link.image ? (
                                            <>
                                                <Image
                                                    src={link.image}
                                                    alt={link.alt}
                                                    width={200}
                                                    height={36}
                                                />
                                                <span className="text-sm">
                                                    {link.title}
                                                </span>
                                            </>
                                        ) : (
                                            <button className="btn btn-outline btn-info">
                                                {link.title}
                                            </button>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-zinc-800 w-full h-0.5 rounded" />
                        <h2 className="text-stone-400">バナーテンプレート</h2>

                        <div
                            role="alert"
                            className="alert alert-success w-96 justify-start"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-current shrink-0 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>このバナーはc30.life公式です。</span>
                        </div>
                        <div
                            role="alert"
                            className="alert alert-warning w-96 justify-start"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-current shrink-0 h-6 w-6"
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
                            <span>乗せる場合は一声おかけください。</span>
                        </div>
                        <Link
                            href="https://c30.life"
                            target="_blank"
                            className="text-center"
                        >
                            <Image
                                src="https://c30.life/c30-life-banner.png"
                                width="234"
                                height="60"
                                alt="ホームページ"
                            />
                        </Link>
                        <Link
                            href="https://c30.life"
                            target="_blank"
                            className="text-center"
                        >
                            <Image
                                src="https://c30.life/c30-life-banner-2.png"
                                width="234"
                                height="60"
                                alt="ホームページ"
                            />
                        </Link>
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
            title: "links",
            description: "c30のリンク集です。",
            url: "https://c30.life/links",
        },
        twitter: {
            description: "c30のリンク集です。",
        },
    }
}
