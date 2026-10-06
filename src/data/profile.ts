// トップページ (src/pages/Home.vue) と noscript 版 (src/noscript/pages/home.ts) で共有するプロフィールデータ
// Vue や DOM には依存させない (vite.config.ts や Pages Functions からも読み込まれる)

export interface Birthday {
  year: number
  // 1 始まり
  month: number
  day: number
}

export const BIRTHDAY: Birthday = { year: 2003, month: 4, day: 25 }

// 日本時間 (UTC+9、サマータイム無し) での年齢。
// Workers やビルド環境は UTC で動くため、ローカルタイムゾーンには依存させない
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

function ageOn(birthday: Birthday, year: number, month: number, day: number) {
  const age = year - birthday.year
  const beforeBirthday =
    month < birthday.month || (month === birthday.month && day < birthday.day)
  return beforeBirthday ? age - 1 : age
}

export function getAge(birthday: Birthday = BIRTHDAY, now: Date = new Date()) {
  const jst = new Date(now.getTime() + JST_OFFSET_MS)
  return ageOn(
    birthday,
    jst.getUTCFullYear(),
    jst.getUTCMonth() + 1,
    jst.getUTCDate(),
  )
}

// ブラウザのローカル日付での年齢 (SPA 用。Confetti の誕生日判定と揃える)
export function getLocalAge(
  birthday: Birthday = BIRTHDAY,
  now: Date = new Date(),
) {
  return ageOn(birthday, now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export const profile = {
  siteName: "c30.life",
  handle: "@ced",
  tagline: "I don't have the energy to make a website.",
  avatar: { src: "/c30_rounded.png", alt: "ced" },
  intro: "いろいろな趣味を持っている変なポットであり空の存在です。",
}

export const backgroundSong = {
  title: "Ced - My Bad Song",
  midiUrl: "/My bad song(piano arrange).mid",
}

// 「その他の情報」の中のバッジ
export interface SecretBadge {
  text: string
  borderClass: string
}

export const secretBadges: SecretBadge[] = [
  { text: "み", borderClass: "border-pink-500" },
  { text: "つ", borderClass: "border-orange-500" },
  { text: "か", borderClass: "border-yellow-500" },
  { text: "ん", borderClass: "border-green-500" },
  { text: "あ", borderClass: "border-teal-500" },
  { text: "じ", borderClass: "border-cyan-500" },
  { text: "し", borderClass: "border-blue-500" },
  { text: "ょ", borderClass: "border-indigo-500" },
  { text: "う", borderClass: "border-purple-500" },
  { text: "ユ!", borderClass: "border-red-500" },
]

export interface LgbtLetter {
  letter: string
  name: string
  highlight: boolean
}

export const lgbtLetters: LgbtLetter[] = [
  { letter: "L", name: "Lesbian", highlight: false },
  { letter: "G", name: "Gay", highlight: false },
  { letter: "B", name: "Bisexual", highlight: false },
  { letter: "T", name: "Transgender", highlight: false },
  { letter: "Q", name: "Queer", highlight: true },
  { letter: "Q", name: "Questioning", highlight: true },
  { letter: "I", name: "Intersex", highlight: false },
  { letter: "A", name: "Asexual", highlight: false },
  { letter: "A", name: "Ally", highlight: false },
  { letter: "P", name: "Pansexual", highlight: false },
  { letter: "P", name: "Polyamorous", highlight: false },
  { letter: "O", name: "Omnisexual", highlight: false },
  { letter: "2S", name: "Two-Spirit", highlight: false },
]

export const fictosexual: LgbtLetter = {
  letter: "F",
  name: "Fictosexual",
  highlight: true,
}

// プロフィール欄 (名前 / 年齢 / 性別 / 住居)
export interface ProfileFact {
  label: string
  value: string | number
  sub: string
}

export function getProfileFacts(
  now: Date = new Date(),
  ageFn: typeof getAge = getAge,
): ProfileFact[] {
  return [
    { label: "名前", value: "c30", sub: "ced(セド)" },
    {
      label: "年齢",
      value: ageFn(BIRTHDAY, now),
      sub: `${BIRTHDAY.month}/${BIRTHDAY.day}`,
    },
    { label: "性別", value: "男", sub: "んい..." },
    { label: "住居", value: "神奈川", sub: "横浜" },
  ]
}

export const hobbies: string[] = [
  "イラストレーション",
  "曲制作・耳コピ",
  "プログラミング",
  "Fediverse, Discord",
]

export interface Language {
  name: string
  // Tailwind の背景色クラス (SPA 用)
  color: string
}

export const languages: Language[] = [
  { name: "Node.js", color: "bg-green-600" },
  { name: "TypeScript", color: "bg-blue-600" },
  { name: "Rust", color: "bg-red-600" },
  { name: "C", color: "bg-blue-900" },
  { name: "C++", color: "bg-blue-800" },
  { name: "C#", color: "bg-purple-600" },
  { name: "ShellScript", color: "bg-neutral-700" },
]

export interface Affiliation {
  name: string
  // Tailwind のクラス (SPA 用)
  className: string
}

export const affiliations: Affiliation[] = [
  {
    name: "炒めて切った野菜ジュース（至り来たり宿）",
    className: "bg-green-900/50 border-green-500 text-green-300",
  },
  {
    name: "DETDA",
    className: "bg-red-950/50 border-red-800 text-red-400",
  },
  {
    name: "Misskey.art",
    className: "bg-pink-900/50 border-pink-500 text-pink-300",
  },
]
