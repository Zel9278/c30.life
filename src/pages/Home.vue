<script setup lang="ts">
import Piano from "../components/Piano.vue"
import Counter from "../components/Counter.vue"

function getAge(data: string): number {
  const splitData = data.split("/")
  const birthday = new Date(
    Number.parseInt(splitData[0], 10),
    Number.parseInt(splitData[1], 10) - 1,
    Number.parseInt(splitData[2], 10),
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

const age = getAge("2003/04/25")

const hobbies = [
  "イラストレーション",
  "曲制作・耳コピ",
  "プログラミング",
  "Fediverse, Discord",
]

const languages = [
  { name: "Node.js", color: "bg-green-600" },
  { name: "TypeScript", color: "bg-blue-600" },
  { name: "Rust", color: "bg-red-600" },
  { name: "C", color: "bg-blue-900" },
  { name: "C++", color: "bg-blue-800" },
  { name: "C#", color: "bg-purple-600" },
  { name: "ShellScript", color: "bg-neutral-700" },
]

const lgbtLetters = [
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

const fictosexual = { letter: "F", name: "Fictosexual", highlight: true }

function toggleTooltip(event: Event) {
  const target = event.currentTarget as HTMLElement
  target.classList.toggle("tooltip-open")
  // Close other tooltips
  document.querySelectorAll(".tooltip-open").forEach((el) => {
    if (el !== target) el.classList.remove("tooltip-open")
  })
}
</script>

<template>
  <!-- Hero Section -->
  <section
    class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto text-center mb-4 md:mb-6"
  >
    <!-- Profile Card -->
    <div
      class="relative overflow-hidden backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
        style="background-image: url(&quot;/profile_background.jpg&quot;)"
      />
      <div class="absolute inset-0 bg-neutral-900/60" />

      <!-- Content -->
      <div class="relative z-10">
        <!-- Avatar with gradient ring -->
        <div class="relative inline-block mb-4">
          <div
            class="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-neutral-600 via-neutral-500 to-neutral-600 p-1"
          >
            <img
              src="/c30_rounded.png"
              alt="ced"
              class="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        <!-- Name & Title -->
        <h1 class="text-3xl md:text-5xl font-bold text-white mb-2">c30.life</h1>
        <p class="text-base md:text-lg text-gray-400 mb-1">@ced</p>
        <p class="text-sm text-gray-500 italic mb-2">
          "I don't have the energy to make a website."
        </p>
        <Counter />

        <!-- Divider -->
        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4 mt-4" />

        <!-- Self Introduction -->
        <h2 class="text-lg font-semibold text-white mb-2">自己紹介</h2>
        <p class="text-neutral-400 text-sm mb-3 leading-relaxed">
          いろいろな趣味を持っている変なポットであり空の存在です。
        </p>
        <div
          class="collapse collapse-arrow bg-neutral-800/50 border border-neutral-700 rounded-lg mb-3"
        >
          <input type="checkbox" />
          <div
            class="collapse-title text-sm text-neutral-500 py-2 min-h-0 flex items-center justify-center gap-2"
          >
            その他の情報
          </div>
          <div class="collapse-content text-neutral-400 text-sm">
            <div class="flex flex-wrap justify-center gap-1.5 pt-1">
              <span
                class="badge bg-neutral-800 border-pink-500 text-neutral-300"
                >み</span
              >
              <span
                class="badge bg-neutral-800 border-orange-500 text-neutral-300"
                >つ</span
              >
              <span
                class="badge bg-neutral-800 border-yellow-500 text-neutral-300"
                >か</span
              >
              <span
                class="badge bg-neutral-800 border-green-500 text-neutral-300"
                >ん</span
              >
              <span
                class="badge bg-neutral-800 border-teal-500 text-neutral-300"
                >あ</span
              >
              <span
                class="badge bg-neutral-800 border-cyan-500 text-neutral-300"
                >じ</span
              >
              <span
                class="badge bg-neutral-800 border-blue-500 text-neutral-300"
                >し</span
              >
              <span
                class="badge bg-neutral-800 border-indigo-500 text-neutral-300"
                >ょ</span
              >
              <span
                class="badge bg-neutral-800 border-purple-500 text-neutral-300"
                >う</span
              >
              <span class="badge bg-neutral-800 border-red-500 text-neutral-300"
                >ユ!</span
              >
            </div>
            <!-- Divider -->
            <div class="bg-neutral-700 w-full h-0.5 rounded my-3" />
            <!-- LGBTQQIAAPPO2S + F -->
            <p class="text-neutral-400 text-sm">
              <span
                v-for="(item, index) in lgbtLetters"
                :key="index"
                class="tooltip cursor-help"
                :class="{ 'text-pink-400 font-semibold': item.highlight }"
                :data-tip="item.name"
                @click="toggleTooltip"
                >{{ item.letter }}</span
              >
              <span> + </span>
              <span
                class="tooltip cursor-help text-pink-400 font-semibold"
                :data-tip="fictosexual.name"
                @click="toggleTooltip"
                >{{ fictosexual.letter }}</span
              >
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

        <!-- Profile Info -->
        <h3 class="text-sm text-neutral-500 mb-2">プロフィール</h3>
        <div class="flex flex-wrap justify-center gap-2 mb-4">
          <div class="border border-neutral-700 rounded-lg p-2 min-w-[70px]">
            <p class="text-xs text-neutral-500">名前</p>
            <p class="text-white font-medium text-sm">c30</p>
            <p class="text-xs text-neutral-400">ced(セド)</p>
          </div>
          <div class="border border-neutral-700 rounded-lg p-2 min-w-[70px]">
            <p class="text-xs text-neutral-500">年齢</p>
            <p class="text-white font-medium text-sm">{{ age }}</p>
            <p class="text-xs text-neutral-400">4/25</p>
          </div>
          <div class="border border-neutral-700 rounded-lg p-2 min-w-[70px]">
            <p class="text-xs text-neutral-500">性別</p>
            <p class="text-white font-medium text-sm">男</p>
            <p class="text-xs text-neutral-400">んい...</p>
          </div>
          <div class="border border-neutral-700 rounded-lg p-2 min-w-[70px]">
            <p class="text-xs text-neutral-500">住居</p>
            <p class="text-white font-medium text-sm">神奈川</p>
            <p class="text-xs text-neutral-400">横浜</p>
          </div>
        </div>

        <!-- Divider -->
        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

        <!-- Hobbies -->
        <h3 class="text-base text-neutral-400 mb-2">趣味</h3>
        <div class="flex flex-wrap justify-center gap-1.5 mb-4">
          <span
            v-for="hobby in hobbies"
            :key="hobby"
            class="badge bg-neutral-800 border-neutral-700 text-neutral-300"
          >
            {{ hobby }}
          </span>
        </div>

        <!-- Programming Languages -->
        <h3 class="text-base text-neutral-400 mb-2">プログラミング言語</h3>
        <div class="flex flex-wrap justify-center gap-1.5 mb-4">
          <span
            v-for="lang in languages"
            :key="lang.name"
            class="badge text-white"
            :class="lang.color"
          >
            {{ lang.name }}
          </span>
        </div>

        <!-- Divider -->
        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

        <!-- Affiliations -->
        <h3 class="text-base text-neutral-400 mb-2">所属</h3>
        <div class="flex flex-wrap justify-center gap-1.5">
          <span class="badge bg-green-900/50 border-green-500 text-green-300">
            炒めて切った野菜ジュース（至り来たり宿）
          </span>
          <span class="badge bg-red-950/50 border-red-800 text-red-400">
            DETDA
          </span>
          <span class="badge bg-pink-900/50 border-pink-500 text-pink-300">
            Misskey.art
          </span>
          <span class="badge bg-sky-900/50 border-sky-500 text-sky-300">
            ZenSky Project
          </span>
          <!-- <span class="badge bg-amber-900/50 border-amber-500 text-amber-300">
            Japan Black MIDI Team
          </span> -->
        </div>
      </div>
    </div>
  </section>

  <!-- Piano Section -->
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3 md:p-4 shadow-2xl overflow-x-auto"
    >
      <Piano />
    </div>
  </section>
</template>
