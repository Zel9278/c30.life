import { Metadata } from "next"
import styles from "@/styles/MIDIs.module.css"
import Link from "next/link"

type Data = {
    url: string
    name: string
    category: string
    fileName: string
    videoID: string | null
}

const midis: Data[] = [
    {
        url: "https://files.c30.life/midis/1.%20Hiyashi%20Tyuuka%20Black%202021.mid",
        name: "Hiyashi Tyuuka Black 2021",
        category: "BlackMIDI",
        fileName: "1. Hiyashi Tyuuka Black 2021.mid",
        videoID: "AqZnB0bCIy8",
    },
    {
        url: "https://files.c30.life/midis/48706_sin%20Badapple%20mushup!!%20kazusakepiano23.mid",
        name: "Badapple mushup",
        category: "BlackMIDI",
        fileName: "48706_sin Badapple mushup!! kazusakepiano23.mid",
        videoID: "4Ks6xL1hrOE",
    },
    {
        url: "https://files.c30.life/midis/Empty2.mid",
        name: "FamilyMart Lag Tester",
        category: "BlackMIDI",
        fileName: "Empty2.mid",
        videoID: "enUxmvZGLOU",
    },
    {
        url: "https://files.c30.life/midis/Hiyasi%20Tyuuka%20Black(ReChannel%20Set).mid",
        name: "Hiyashi Tyuuka Black",
        category: "BlackMIDI",
        fileName: "Hiyasi Tyuuka Black(ReChannel Set).mid",
        videoID: "cQ88324j5DI",
    },
    {
        url: "https://files.c30.life/midis/SandCanyon%20V2(ReChannel%20Set).mid",
        name: "SandCanyon V2",
        category: "BlackMIDI",
        fileName: "SandCanyon V2(ReChannel Set).mid",
        videoID: "ItVSm-H8sCU",
    },
]

export default async function Home() {
    return (
        <>
            <main>
                <div className="text-center">
                    <p>公開されているMIDIの数: {midis.length}</p>
                    <Link
                        href="https://c30.booth.pm/items/5142779"
                        className="btn btn-outline btn-secondary"
                        target="_blank"
                    >
                        BoothでMIDIを販売しています。
                    </Link>
                </div>
                <div className="bg-zinc-800 w-96 h-0.5 rounded mt-4 mb-4" />
                <ul className={styles["card-container"]}>
                    {midis.map((midi, i) => {
                        return (
                            <div
                                key={i}
                                className="card card-compact w-auto bg-base-300 shadow-xl"
                            >
                                <div className="card-body">
                                    <h2 className="card-title">{midi.name}</h2>
                                    <p>{midi.fileName}</p>
                                    <p>Category: {midi.category}</p>
                                    <div className="card-actions justify-end">
                                        <Link
                                            className="btn btn-primary"
                                            href={midi.url}
                                        >
                                            Download
                                        </Link>
                                    </div>
                                    {midi.videoID && (
                                        <figure>
                                            <iframe
                                                src={
                                                    "https://www.youtube.com/embed/" +
                                                    midi.videoID
                                                }
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </figure>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </ul>
            </main>
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
