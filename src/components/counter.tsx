"use client"

import axios, { AxiosResponse } from "axios"
import { ReactNode, useEffect, useState } from "react"

type Props = {
    children?: ReactNode
}

type ResponseData = {
    count: number
}

export default function Counter(progs: Props) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        axios
            .post(`/api/v1/counter`, {})
            .then((data: AxiosResponse<ResponseData>) =>
                setCount(data.data.count)
            )
    }, [])

    return <p className="text-sm">あなたは今、{count}個目のポットです。</p>
}
