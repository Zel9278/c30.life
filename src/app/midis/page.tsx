import { Metadata } from "next"

export default async function Home() {
    return (
        <>
            <main></main>
        </>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30が作ったMIDIです。",
        openGraph: {
            title: "midis - c30 life",
            description: "c30が作ったMIDIです。",
            url: "https://c30.life/midis",
        },
    }
}
