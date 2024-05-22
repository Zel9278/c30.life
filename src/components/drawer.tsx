"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

type Props = {
    children?: ReactNode
}

const links = [
    { href: "/", label: "Home" },
    { href: "/links", label: "Links" },
    { href: "/blog", label: "Blog" },
    { href: "/misskey", label: "Misskey Links" },
    { href: "/mastodon", label: "Mastodon Links" },
    { href: "/servers", label: "My Fediverse Servers" },
    { href: "/midis", label: "MIDI Downloads" },
    { href: "/mdic", label: "Misskey Default Icon Checker" },
    { href: "/pubkeys", label: "Public keys" },
    { href: "/info", label: "Info" },
]

export default function Drawer(progs: Props) {
    const pathname = usePathname()

    return (
        <div className="drawer lg:drawer-open">
            <input id="drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">{progs.children}</div>
            <div className="drawer-side">
                <label htmlFor="drawer" className="drawer-overlay"></label>
                <ul className="menu rounded-box p-4 w-80 h-full bg-base-100/[.06] backdrop-blur-sm shadow-lg text-base-content border-r-slate-700 border-r-2">
                    {links.map(({ href, label }) => (
                        <li key={`${href}${label}`} className="mb-4">
                            <Link
                                href={href}
                                className={`menu-item ${
                                    pathname === href
                                        ? "bg-[#04ff7552] hover:bg-[#31be7152]"
                                        : ""
                                }`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
