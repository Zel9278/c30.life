import { ReactNode } from "react"

type Props = {
    children?: ReactNode
}

export default function Connected(progs: Props) {
    return <h1>Disconnected</h1>
}
