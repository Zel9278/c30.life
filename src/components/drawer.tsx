"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"

type Props = {
  children?: ReactNode
}

type LinkData = {
  href: string
  label: string
  tooltip?: string
}

const links: LinkData[] = [
  {
    href: "/",
    label: "Home",
    tooltip: '上の"c30 life"からもHomeに飛べるよ！',
  },
  { href: "/links", label: "Links" },
  { href: "/blog", label: "Blog" },
  { href: "/environments", label: "Environments" },
  { href: "/misskey", label: "Misskey Links" },
  { href: "/mastodon", label: "Mastodon Links" },
  { href: "/watched-animes", label: "Anime I watched" },
  { href: "/servers", label: "My Fediverse Servers" },
  { href: "/midis", label: "MIDI Downloads" },
  { href: "/pubkeys", label: "Public keys" },
  { href: "/info", label: "Info" },
]

export default function Drawer(progs: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [])

  const close = () => {
    setIsOpen(false)
  }

  return (
    <div className="drawer">
      <input
        id="drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={() => setIsOpen(!isOpen)}
      />

      <div className="drawer-content">{progs.children}</div>

      <div className="drawer-side">
        <label
          htmlFor="drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <ul
          className="menu p-4 w-80 min-h-full bg-base-100/[.06] backdrop-blur-sm 
          shadow-lg text-base-content border-r-slate-700 border-r-2 pt-16 overflow-y-auto"
        >
          {links.map((l) => (
            <li
              key={l.href}
              className={`${l.tooltip ? "tooltip tooltip-bottom before:sticky after:sticky" : ""}`}
              data-tip={l.tooltip}
            >
              <Link
                href={l.href}
                className={`menu-item py-2 ${
                  pathname === l.href
                    ? "bg-[#04ff7552] hover:bg-[#31be7152]"
                    : ""
                }`}
                onClick={close}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
