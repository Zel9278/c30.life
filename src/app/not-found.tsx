"use client"

import { useEffect, useState } from "react"

export default function NotFound() {
    const [text, setText] = useState("")

    useEffect(() => {
        const texts = [
            "Error: Page load failed",
            "",
            "Description:",
            "The requested page could not be loaded.",
            "",
            "Details:",
            "Error Code: 404",
            "Error Type: Page Not Found",
            "Error Message: The requested page could not be found.",
            "",
            "5 Seconds to Home",
        ]

        async function run() {
            for (const line of texts) {
                setText((text) => text + line + "\n")
                await sleep(Math.random() * (200 - 10) + 10)
            }

            await sleep(5000)
            window.location.href = "/"
        }

        run()
    }, [])

    return (
        <div>
            <pre>{text}</pre>
        </div>
    )
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
