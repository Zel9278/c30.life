import Image from "next/image"
import Link from "next/link"
import homeStyles from "@/styles/HomePage.module.css"
import Counter from "@/components/counter"
import Timeline from "@/components/timeline"

function getAge(data: string) {
  const splitData = data.split("/")
  const birthday = new Date(
    Number.parseInt(splitData[0], 0),
    Number.parseInt(splitData[1], 0) - 1,
    Number.parseInt(splitData[2], 0),
  )
  const today = new Date()
  const thisYearBirthday = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate(),
  )
  const age = today.getFullYear() - birthday.getFullYear()

  return today < thisYearBirthday ? age - 1 : age
}

export default async function Home() {
  return (
    <>
      <div className="text-center text-2xl">
        <p>
          c30 lifeへようこそ、ここはc30(ced)のホームページになっております。
        </p>
        <Counter />
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
                  unoptimized
                />
              </figure>
              <h2 className="card-title">自己紹介</h2>
              <p className="text-lg">
                いろいろな趣味を持っている変なポットであり空の存在です。
                <br />
                Misskey系列のサーバーの
                <a
                  href="https://misskey.art"
                  className="text-sky-500 hover:text-sky-700"
                >
                  Misskey.art
                </a>
                の運営をしています。
                <br />
                知的障害、うつ病、自閉症スペクトラム持ちです。
              </p>
              <div className="bg-zinc-800 w-full h-0.5 rounded" />
              <h3 className="text-sm text-stone-400">プロフィール</h3>
              <div className="flex">
                <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                  <p className="text-sm text-stone-400">名前</p>
                  <p>c30</p>
                  <p className="text-sm">ced(セド)</p>
                </div>

                <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                  <p className="text-sm text-stone-400">年齢</p>
                  <p>{getAge("2003/04/25")}</p>
                  <p className="text-sm">4/25</p>
                </div>
                <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                  <p className="text-sm text-stone-400">性別</p>
                  <p>男</p>
                  <p className="text-sm">んい...</p>
                </div>
                <div className="border-2 border-stone-800 border-opacity-25 text-center rounded p-2">
                  <p className="text-sm text-stone-400">住居</p>
                  <p>神奈川</p>
                  <p className="text-sm">横浜</p>
                </div>
              </div>
              <div className="bg-zinc-800 w-full h-0.5 rounded" />
              <h3 className="text-xl text-stone-400">趣味</h3>
              <div id="hobby-badges">
                <div className="badge bg-base-100">イラストレーション</div>
                <div className="badge bg-base-100">曲制作・耳コピ</div>
                <div className="badge bg-base-100">プログラミング</div>
                <div className="badge bg-base-100">Fediverse, Discord</div>
              </div>
              <h3 className="text-xl text-stone-400">プログラミング言語</h3>
              <div id="proggraming-badges">
                <div className="badge bg-green-600">Node.js</div>
                <div className="badge bg-blue-600">TypeScript</div>
                <div className="badge bg-red-600">Rust</div>
                <div className="badge bg-blue-900">C</div>
                <div className="badge bg-blue-800">C++</div>
                <div className="badge bg-purple-600">C#</div>
                <div className="badge">ShellScript</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800 w-full h-0.5 rounded" />
      <div className={homeStyles["self-introduction"]}>
        <details className="collapse collapse-arrow bg-base-200">
          <summary className="collapse-title text-xl font-medium">ログ</summary>
          <div className="collapse-content max-h-full">
            <Timeline />
          </div>
        </details>
      </div>
      <p className="text-base-100 hover:text-white text-center">
        特になにもないよ
      </p>
    </>
  )
}
