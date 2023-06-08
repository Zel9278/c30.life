import Head from "next/head"
import Image from "next/image"
import { readFileSync, writeFileSync, existsSync } from "fs"
import homeStyles from "@/styles/Home.module.css"
import Fireworks from "@/components/fireworks"

function getAge(data: string) {
    let splitData = data.split("/")
    let birthday = new Date(
        parseInt(splitData[0], 0),
        parseInt(splitData[1], 0) - 1,
        parseInt(splitData[2], 0)
    )
    let today = new Date()
    let thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
    )
    let age = today.getFullYear() - birthday.getFullYear()

    return today < thisYearBirthday ? age - 1 : age
}

const getCounter = async () => {
    const counter: string = readFileSync("./.counter", "utf8")
    let count: number = parseInt(counter, 10)

    count = count + 1

    writeFileSync("./.counter", `${count}`)

    return count
}

export default async function Home() {
    const counter = await getCounter()

    return (
        <>
            <main>
                <div className="text-center text-2xl">
                    <p>
                        c30
                        lifeへようこそ、ここはc30(ced)のホームページになっております。
                    </p>
                    <p className="text-sm">
                        あなたは今、{counter}個目のポットです。
                    </p>
                    <div className={homeStyles["self-introduction"]}>
                        <div className="card w-auto bg-base-300 shadow-xl m-5">
                            <div className="card-body items-center text-center">
                                <figure>
                                    <Image
                                        src="/cedpet.gif"
                                        alt="c30 icon"
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                </figure>
                                <h2 className="card-title">自己紹介</h2>
                                <p className="text-lg">
                                    いろいろな趣味を持っている変なポットであり空の存在です、最近はMisskeyのサーバー「Misskey.art」の運営をしています。
                                </p>
                                <div className="bg-zinc-800 w-full h-0.5 rounded" />
                                <h3 className="text-sm text-stone-400">
                                    プロフィール
                                </h3>
                                <div className="flex">
                                    <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                                        <p className="text-sm text-stone-400">
                                            名前
                                        </p>
                                        <p>c30</p>
                                        <p className="text-sm">ced(セド)</p>
                                    </div>

                                    <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                                        <p className="text-sm text-stone-400">
                                            年齢
                                        </p>
                                        <p>{getAge("2003/04/25")}</p>
                                        <p className="text-sm">4/25</p>
                                    </div>
                                    <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                                        <p className="text-sm text-stone-400">
                                            性別
                                        </p>
                                        <p>男</p>
                                        <p className="text-sm">んい...</p>
                                    </div>
                                    <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                                        <p className="text-sm text-stone-400">
                                            生地
                                        </p>
                                        <p>Misskey</p>
                                        <p className="text-sm">art町</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-800 w-full h-0.5 rounded" />
                                <h3 className="text-xl text-stone-400">趣味</h3>
                                <div id="hobby-badges">
                                    <div className="badge bg-zinc-900">
                                        イラストレーション
                                    </div>
                                    <div className="badge bg-zinc-900">
                                        曲制作・耳コピ
                                    </div>
                                    <div className="badge bg-zinc-900">
                                        プログラミング
                                    </div>
                                    <div className="badge bg-zinc-900">
                                        Misskey
                                    </div>
                                </div>
                                <h3 className="text-xl text-stone-400">
                                    プログラミング言語
                                </h3>
                                <div id="proggraming-badges">
                                    <div className="badge bg-green-600">
                                        Node.js
                                    </div>
                                    <div className="badge bg-blue-600">
                                        TypeScript
                                    </div>
                                    <div className="badge bg-red-600">Rust</div>
                                    <div className="badge bg-blue-800">C++</div>
                                    <div className="badge bg-purple-600">
                                        C#
                                    </div>
                                    <div className="badge">ShellScript</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-base-100 hover:text-white text-center">
                    特になにもないよ
                </p>
            </main>
            <Fireworks />
        </>
    )
}
