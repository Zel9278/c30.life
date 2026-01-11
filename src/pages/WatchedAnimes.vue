<script setup lang="ts">
type Genre = "映画" | "アニメ"

type Anime = {
  title: string
  genre: Genre
  date?: string
  url: string
  rating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
}

const anime2025: Anime[] = [
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

const anime2024: Anime[] = [
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

const animeUnknown: Anime[] = [
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

const ratingStar = (rating: number) => {
  const fullStars = Math.floor(rating / 2)
  const halfStar = rating % 2
  const emptyStars = 5 - fullStars - halfStar
  return { fullStars, halfStar, emptyStars, rating }
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        Animes I watched
      </h1>
      <p class="text-neutral-400 text-sm mb-4">c30の見たアニメリスト</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <p class="text-neutral-300 text-sm mb-4">
        2023までの見たアニメは何となく覚えてるけど見た時期を忘れたので詳しい時期を書けない...<br />
        あと見ても内容忘れたりするのでオタクではないです（？）
      </p>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              <th
                class="border border-neutral-600 bg-neutral-800/50 px-3 py-2 text-white"
              >
                タイトル
              </th>
              <th
                class="border border-neutral-600 bg-neutral-800/50 px-3 py-2 text-white"
              >
                ジャンル
              </th>
              <th
                class="border border-neutral-600 bg-neutral-800/50 px-3 py-2 text-white"
              >
                見た時期
              </th>
              <th
                class="border border-neutral-600 bg-neutral-800/50 px-3 py-2 text-white"
              >
                個人的評価
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 2025 Header -->
            <tr>
              <td colspan="4" class="py-2 text-green-400 font-semibold">
                2025
              </td>
            </tr>
            <!-- 2025 Animes -->
            <tr v-for="anime in anime2025" :key="anime.title">
              <td class="border border-neutral-600 px-3 py-2">
                <a
                  :href="anime.url"
                  class="text-blue-400 hover:underline hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ anime.title }}
                </a>
              </td>
              <td class="border border-neutral-600 px-3 py-2 text-neutral-300">
                {{ anime.genre }}
              </td>
              <td class="border border-neutral-600 px-3 py-2 text-neutral-300">
                {{ anime.date }}
              </td>
              <td class="border border-neutral-600 px-3 py-2">
                <span
                  v-for="i in ratingStar(anime.rating).fullStars"
                  :key="`full-${i}`"
                  class="text-yellow-400"
                  >★</span
                >
                <span
                  v-if="ratingStar(anime.rating).halfStar > 0"
                  class="text-yellow-400"
                  >✢</span
                >
                <span
                  v-for="i in ratingStar(anime.rating).emptyStars"
                  :key="`empty-${i}`"
                  class="text-gray-500"
                  >★</span
                >
                <span class="text-neutral-400 ml-1"
                  >({{ anime.rating }}/10)</span
                >
              </td>
            </tr>
            <!-- 2024 Header -->
            <tr>
              <td colspan="4" class="py-2 text-green-400 font-semibold">
                2024
              </td>
            </tr>
            <!-- 2024 Animes -->
            <tr v-for="anime in anime2024" :key="anime.title">
              <td class="border border-neutral-600 px-3 py-2">
                <a
                  :href="anime.url"
                  class="text-blue-400 hover:underline hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ anime.title }}
                </a>
              </td>
              <td class="border border-neutral-600 px-3 py-2 text-neutral-300">
                {{ anime.genre }}
              </td>
              <td class="border border-neutral-600 px-3 py-2 text-neutral-300">
                {{ anime.date }}
              </td>
              <td class="border border-neutral-600 px-3 py-2">
                <span
                  v-for="i in ratingStar(anime.rating).fullStars"
                  :key="`full-${i}`"
                  class="text-yellow-400"
                  >★</span
                >
                <span
                  v-if="ratingStar(anime.rating).halfStar > 0"
                  class="text-yellow-400"
                  >✢</span
                >
                <span
                  v-for="i in ratingStar(anime.rating).emptyStars"
                  :key="`empty-${i}`"
                  class="text-gray-500"
                  >★</span
                >
                <span class="text-neutral-400 ml-1"
                  >({{ anime.rating }}/10)</span
                >
              </td>
            </tr>
            <!-- Unknown Header -->
            <tr>
              <td colspan="4" class="py-2 text-green-400 font-semibold">---</td>
            </tr>
            <!-- Unknown Animes -->
            <tr v-for="anime in animeUnknown" :key="anime.title">
              <td class="border border-neutral-600 px-3 py-2">
                <a
                  :href="anime.url"
                  class="text-blue-400 hover:underline hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ anime.title }}
                </a>
              </td>
              <td class="border border-neutral-600 px-3 py-2 text-neutral-300">
                {{ anime.genre }}
              </td>
              <td class="border border-neutral-600 px-3 py-2 text-neutral-300">
                {{ anime.date }}
              </td>
              <td class="border border-neutral-600 px-3 py-2">
                <span
                  v-for="i in ratingStar(anime.rating).fullStars"
                  :key="`full-${i}`"
                  class="text-yellow-400"
                  >★</span
                >
                <span
                  v-if="ratingStar(anime.rating).halfStar > 0"
                  class="text-yellow-400"
                  >✢</span
                >
                <span
                  v-for="i in ratingStar(anime.rating).emptyStars"
                  :key="`empty-${i}`"
                  class="text-gray-500"
                  >★</span
                >
                <span class="text-neutral-400 ml-1"
                  >({{ anime.rating }}/10)</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
