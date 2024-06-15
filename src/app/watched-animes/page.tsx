import { Metadata } from "next"
import Link from "next/link"

type Genre = "映画" | "アニメ"

type Anime = {
    title: string
    genre: Genre
    date?: string
    url: string
    rating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
}

const Anime2024: Anime[] = [
    {
        title: "鬼太郎誕生 ゲゲゲの謎",
        genre: "映画",
        date: "2024/01~",
        url: "https://www.kitaro-tanjo.com/",
        rating: 10,
    },
    {
        title: "勇気爆発バーンブレイバーン",
        genre: "アニメ",
        date: "2024/03~",
        url: "https://bangbravern.com/",
        rating: 10,
    },
    {
        title: "とんでもスキルで異世界放浪メシ（一期）",
        genre: "アニメ",
        date: "2024/06/11",
        url: "https://tondemoskill-anime.com/",
        rating: 10,
    },
]

const AnimeUnknown: Anime[] = [
    {
        title: "魔法少女まどか☆マギカ",
        genre: "アニメ",
        url: "https://www.madoka-magica.com/",
        rating: 9,
    },
    {
        title: "ゆるキャン△",
        genre: "アニメ",
        url: "https://yurucamp.jp/",
        rating: 10,
    },
    {
        title: "ぼっち・ざ・ろっく！",
        genre: "アニメ",
        url: "https://bocchi.rocks/",
        rating: 10,
    },
    {
        title: "けいおん！",
        genre: "アニメ",
        url: "https://www.tbs.co.jp/anime/k-on/",
        rating: 10,
    },
    {
        title: "エロマンガ先生",
        genre: "アニメ",
        url: "https://eromanga-sensei.com/",
        rating: 9,
    },
    {
        title: "社畜さんは幼女幽霊に癒されたい。",
        genre: "アニメ",
        url: "https://shachikusan.com/",
        rating: 10,
    },
    {
        title: "けものフレンズ（一期）",
        genre: "アニメ",
        url: "https://kemono-friends.jp/",
        rating: 10,
    },
    {
        title: "NEW GAME!",
        genre: "アニメ",
        url: "http://newgame-anime.com/",
        rating: 10,
    },
]

export default function Home() {
    return (
        <>
            <main>
                <div className="card w-full bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Animes I watched</h2>
                        <div className="bg-zinc-400 w-full h-0.5 rounded" />{" "}
                        <p>
                            2023までの見たアニメは何となく覚えてるけど見た時期を忘れたので詳しい時期を書けない...
                            <br />
                            あと見ても内容忘れたりするのでオタクではないです（？）
                        </p>
                        <table className="border-collapse text-center">
                            <thead>
                                <tr>
                                    <th className="border border-stone-300 border-solid px-1.5">
                                        タイトル
                                    </th>
                                    <th className="border border-stone-300 border-solid px-1.5">
                                        ジャンル
                                    </th>
                                    <th className="border border-stone-300 border-solid px-1.5">
                                        見た時期
                                    </th>
                                    <th className="border border-stone-300 border-solid px-1.5">
                                        個人的評価
                                    </th>
                                </tr>{" "}
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th className="text-green-400">2024</th>
                                    <th></th>
                                </tr>
                                {Anime2024.map((anime) => (
                                    <tr key={anime.title}>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            <Link
                                                href={anime.url}
                                                className="text-blue-400 hover:underline hover:text-blue-300"
                                                target="_blank"
                                            >
                                                {anime.title}
                                            </Link>
                                        </td>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            {anime.genre}
                                        </td>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            {anime.date}
                                        </td>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            {ratingStar(anime.rating)}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th className="text-green-400">---</th>
                                    <th></th>
                                </tr>
                                {AnimeUnknown.map((anime) => (
                                    <tr key={anime.title}>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            <Link
                                                href={anime.url}
                                                className="text-blue-400 hover:underline hover:text-blue-300"
                                                target="_blank"
                                            >
                                                {anime.title}
                                            </Link>
                                        </td>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            {anime.genre}
                                        </td>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            {anime.date}
                                        </td>
                                        <td className="border border-stone-300 border-solid px-1.5">
                                            {ratingStar(anime.rating)}
                                        </td>
                                    </tr>
                                ))}
                            </thead>
                        </table>
                    </div>
                </div>
            </main>
        </>
    )
}

function ratingStar(rating: number): JSX.Element {
    const fullStars = Math.floor(rating / 2)
    const halfStar = rating % 2
    const emptyStars = 5 - fullStars - halfStar

    return (
        <p>
            {Array.from({ length: fullStars }).map((_, index) => (
                <span key={`full-${index}`} className="text-yellow-400">
                    ★
                </span>
            ))}
            {halfStar > 0 && (
                <span className="text-yellow-400 bg-gradient-to-br">✢</span>
            )}
            {Array.from({ length: emptyStars }).map((_, index) => (
                <span key={`empty-${index}`} className="text-gray-400">
                    ★
                </span>
            ))}{" "}
            ({rating}/10)
        </p>
    )
}

export function generateMetadata(): Metadata {
    return {
        description: "c30の見たアニメリストです。",
        openGraph: {
            title: "Anime I watched",
            description: "c30の見たアニメリストです。",
            url: "https://c30.life/animes",
        },
    }
}
