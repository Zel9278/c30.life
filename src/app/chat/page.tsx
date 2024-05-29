"use client"

import { ReactNode, useEffect, useState } from "react"
import Connected from "@/components/chat/connected"
import Disconnected from "@/components/chat/disconnected"

export default function Home() {
    const [client, setClient] = useState<WebSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")

    function connect(cli: WebSocket | null): WebSocket {
        if (cli) return cli
        return new WebSocket("wss://c30-chat-server.tty7.uk")
    }

    useEffect(() => {
        setClient(connect)
    }, [setClient])

    useEffect(() => {
        if (!client) return

        client.onopen = () => {
            console.log("WebSocket is open now.")
            setIsConnected(true)
        }
        client.onclose = () => {
            console.log("WebSocket is closed now.")
            setIsConnected(false)
            setClient(null)

            setTimeout(() => {
                setClient(connect)
            }, 3500)
        }
        client.onmessage = (msg) => {
            console.log(msg)
        }
    }, [client])

    return (
        <>
            <p>testing</p>
            {isConnected ? <Connected /> : <Disconnected />}
        </>
    )
}
