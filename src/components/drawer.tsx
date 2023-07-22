import Link from "next/link"
import { ReactNode } from "react"

type Props = {
    children?: ReactNode
}

export default function Drawer(progs: Props) {
    return (
        <div className="drawer lg:drawer-open">
            <input id="drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">{progs.children}</div>
            <div className="drawer-side">
                <label htmlFor="drawer" className="drawer-overlay"></label>
                <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
                    <li>
                        <Link href="/links">Links</Link>
                    </li>
                    <li>
                        <Link href="/misskey">Misskey Links</Link>
                    </li>
                    <li>
                        <Link href="/servers">My Fediverse Servers</Link>
                    </li>
                    <li>
                        <Link href="/midis">MIDI Downloads</Link>
                    </li>
                    <li>
                        <Link href="/mdic">Misskey Default Icon Checker</Link>
                    </li>
                    <li>
                        <Link href="/pubkeys">Public keys</Link>
                    </li>
                    <li>
                        <Link href="/info">Info</Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}
