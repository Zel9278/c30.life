"use client"

import { ReactNode, useState, useEffect } from "react"

type Props = {
    children?: ReactNode
    ws: WebSocket | null
    id: string
}

type Message = {
    type: "message"
    id: string
    message: string
}

export default function Connected(progs: Props) {
    const [ws, setWs] = useState(progs.ws)
    const [id, setId] = useState(progs.id)
    const [messages, setMessages] = useState<Message[]>([])
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data)

            if (data.type === "message") {
                setMessages([...messages, data])
            }
        }
    }, [ws])

    return (
        <>
            <h1>Connected on {progs.id}</h1>
            <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setMessage(e.target.value)}
            />
            <button
                className="btn btn-primary"
                onClick={() => {
                    if (!ws) return
                    ws.send(JSON.stringify({ type: "message", id, message }))
                    setMessage("")
                }}
            >
                Send
            </button>
            <div>
                {messages.map((msg, i) => (
                    <p key={i}>
                        {msg.id}: {msg.message}
                    </p>
                ))}
            </div>
        </>
    )
}
