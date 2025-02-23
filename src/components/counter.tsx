"use client"

import { type ReactNode, useEffect, useState } from "react"

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
    fetch("/api/v1/counter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blogId: progs.blogId }),
    })
      .then((response) => response.json())
      .then((data: ResponseData) => setCount(data.count))
  }, [progs.blogId])

  return progs.blogId ? (
    <p className="text-sm">{count}回この記事が閲覧されました。</p>
  ) : (
    <p className="text-sm">あなたは今、{count}個目のポットです。</p>
  )
}
