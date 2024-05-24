"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type Props = {
    title: string
    url: string
}

export function ClipBoard({ title, url }: Props) {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (copied) {
            setTimeout(() => {
                setCopied(false)
            }, 1000)
        }
    }, [copied])

    return (
        <Link
            href="#"
            className="text-[#00a4de] hover:underline hover:text-[#8bcdf7]"
            onClick={(target) => {
                navigator.clipboard.writeText(`${title} ${url}`)
                setCopied(true)
            }}
        >
            Copy to ClipBoard{copied ? " [Copied!]" : ""}
        </Link>
    )
}
