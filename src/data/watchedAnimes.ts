// /watched-animes ページのデータ (SPA と noscript で共有する)

export type AnimeGenre = "映画" | "アニメ"

export type Anime = {
  title: string
  genre: AnimeGenre
  date?: string
  url: string
  rating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
}

export const watchedAnimesPage = {
  title: "Animes I watched",
  subtitle: "c30の見たアニメリスト",
  // 表示時は行ごとに <br /> で区切る
  intro: [
    "2023までの見たアニメは何となく覚えてるけど見た時期を忘れたので詳しい時期を書けない...",
    "あと見ても内容忘れたりするのでオタクではないです（？）",
  ],
}

export const animeTableHeaders = [
  "タイトル",
  "ジャンル",
  "見た時期",
  "個人的評価",
] as const

export const anime2025: Anime[] = [
  {
    title: "機動戦士ガンダムユニコーン RE:0096",
    genre: "アニメ",
    date: "2025/8/20",
    url: "https://www.gundam-unicorn.net/tv/",
    rating: 10,
  },
  {
    title: "機動戦士Gundam GQuuuuuuX",
    genre: "アニメ",
    date: "2025/8/16",
    url: "https://www.gundam.info/feature/gquuuuuux/",
    rating: 10,
  },
  {
    title: "ルックバック",
    genre: "映画",
    date: "2025/04/14",
    url: "https://lookback-anime.com/",
    rating: 10,
  },
]

export const anime2024: Anime[] = [
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

export const animeUnknown: Anime[] = [
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
  {
    title: "ご注文はうさぎですか?（一期）",
    genre: "アニメ",
    url: "https://gochiusa.com/",
    rating: 10,
  },
  {
    title: "らき☆すた",
    genre: "アニメ",
    url: "https://ja.wikipedia.org/wiki/%E3%82%89%E3%81%8D%E2%98%86%E3%81%99%E3%81%9F_(%E3%82%A2%E3%83%8B%E3%83%A1)",
    rating: 10,
  },
  {
    title: "私に天使が舞い降りた!",
    genre: "アニメ",
    url: "http://watatentv.com/",
    rating: 10,
  },
]

export type AnimeGroup = {
  label: string
  animes: Anime[]
}

export const animeGroups: AnimeGroup[] = [
  { label: "2025", animes: anime2025 },
  { label: "2024", animes: anime2024 },
  { label: "---", animes: animeUnknown },
]

// 10 段階評価を ★ 5 個 (半分は ✢) に変換する
export const ratingStar = (rating: number) => {
  const fullStars = Math.floor(rating / 2)
  const halfStar = rating % 2
  const emptyStars = 5 - fullStars - halfStar
  return { fullStars, halfStar, emptyStars, rating }
}
