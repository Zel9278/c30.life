"use client"

import axios, { AxiosResponse } from "axios"
import { ReactNode, useEffect, useState } from "react"

type Props = {
    children?: ReactNode
    blogId?: string
}

type ResponseData = {
    count: number
}

export default function Counter(progs: Props) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        axios
            .post(`/api/v1/counter`, {
                blogId: progs.blogId,
            })
            .then((data: AxiosResponse<ResponseData>) =>
                setCount(data.data.count),
            )
    }, [progs.blogId])

    return progs.blogId ? (
        <p className="text-sm">{count}回この記事が閲覧されました。</p>
    ) : (
        <p className="text-sm">あなたは今、{count}個目のポットです。</p>
    )
}
