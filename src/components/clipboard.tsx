"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type Props = {
    title: string
    text: string
}

export function ClipBoard({ title, text }: Props) {
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
                navigator.clipboard.writeText(text)
                setCopied(true)
            }}
        >
            Copy to ClipBoard({title}){copied ? " [Copied!]" : ""}
        </Link>
    )
}
