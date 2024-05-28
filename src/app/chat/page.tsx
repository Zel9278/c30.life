"use client"

import { ReactNode, useEffect, useState } from "react"
import Connected from "@/components/chat/connected"
import Disconnected from "@/components/chat/disconnected"

export default function Home() {
    const [client, setClient] = useState<WebSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [reConnectDelay, setReConnectDelay] = useState(1000)

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
            setReConnectDelay(1000)
        }
        client.onclose = () => {
            console.log("WebSocket is closed now.")
            setIsConnected(false)
            setClient(null)

            setTimeout(() => {
                setReConnectDelay(reConnectDelay + 250)
                setClient(connect)
            }, reConnectDelay)
        }
    }, [client, reConnectDelay])

    return (
        <>
            <p>testing</p>
            {isConnected ? <Connected /> : <Disconnected />}
        </>
    )
}
