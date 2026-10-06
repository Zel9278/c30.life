<script setup lang="ts">
import Counter from "../components/Counter.vue"
import Piano from "../components/Piano.vue"
import PianoRoll from "../components/PianoRoll.vue"
import {
  affiliations,
  backgroundSong,
  fictosexual,
  getLocalAge,
  getProfileFacts,
  hobbies,
  languages,
  lgbtLetters,
  profile,
  secretBadges,
} from "../data/profile.ts"

const profileFacts = getProfileFacts(new Date(), getLocalAge)

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
  <!-- Background Piano Roll -->
  <PianoRoll
    :midi-url="backgroundSong.midiUrl"
    note-color="#1133aa"
    :pixels-per-beat="64"
    :opacity="0.64"
  />

  <!-- Song Title -->
  <div class="fixed top-14 left-4 z-10 text-neutral-500 text-sm opacity-60">
    Background: {{ backgroundSong.title }}
  </div>

  <!-- Hero Section -->
  <section
    class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto text-center mb-4 md:mb-6"
  >
    <!-- Profile Card -->
    <div
      class="relative overflow-hidden backdrop-blur-md bg-neutral-900/40 border border-neutral-700/50 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center blur-sm opacity-10"
        style="background-image: url(&quot;/profile_background.jpg&quot;)"
      />
      <div class="absolute inset-0 bg-neutral-900/10" />

      <!-- Content -->
      <div class="relative z-10">
        <!-- Avatar with gradient ring -->
        <div class="relative inline-block mb-4">
          <div
            class="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-neutral-600 via-neutral-500 to-neutral-600 p-1"
          >
            <img
              :src="profile.avatar.src"
              :alt="profile.avatar.alt"
              class="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        <!-- Name & Title -->
        <h1 class="text-3xl md:text-5xl font-bold text-white mb-2">
          {{ profile.siteName }}
        </h1>
        <p class="text-base md:text-lg text-gray-400 mb-1">
          {{ profile.handle }}
        </p>
        <p class="text-sm text-gray-500 italic mb-2">
          "{{ profile.tagline }}"
        </p>
        <Counter />

        <!-- Divider -->
        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4 mt-4" />

        <!-- Self Introduction -->
        <h2 class="text-lg font-semibold text-white mb-2">自己紹介</h2>
        <p class="text-neutral-400 text-sm mb-3 leading-relaxed">
          {{ profile.intro }}
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
                v-for="(badge, index) in secretBadges"
                :key="index"
                :class="[
                  'badge bg-neutral-800',
                  badge.borderClass,
                  'text-neutral-300',
                ]"
                >{{ badge.text }}</span
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
          <div
            v-for="fact in profileFacts"
            :key="fact.label"
            class="border border-neutral-700 rounded-lg p-2 min-w-[70px]"
          >
            <p class="text-xs text-neutral-500">{{ fact.label }}</p>
            <p class="text-white font-medium text-sm">{{ fact.value }}</p>
            <p class="text-xs text-neutral-400">{{ fact.sub }}</p>
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
          <span
            v-for="affiliation in affiliations"
            :key="affiliation.name"
            :class="['badge', affiliation.className]"
          >
            {{ affiliation.name }}
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- Piano Section -->
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-md bg-neutral-900/40 border border-neutral-700/50 rounded-2xl p-3 md:p-4 shadow-2xl overflow-x-auto"
    >
      <Piano />
    </div>
  </section>
</template>
