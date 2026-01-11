<script setup lang="ts">
type Link = {
  title: string
  href: string
  image?: string | null
  alt?: string
}

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const contacts: Link[] = [
  {
    title: "X (旧Twitter)",
    href: "https://x.com/fuji_ced",
  },
  {
    title: "Discord",
    href: "https://discord.gg/X7RrHwV4US",
  },
  {
    title: "Mail",
    href: "mailto:ced@c30.life",
  },
  {
    title: "Misskey",
    href: "https://mk.c30.life/@c30",
  },
]

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const socialLinks: Link[] = [
  {
    title: "Misskey.art",
    href: "https://misskey.art/@c30",
  },
  {
    title: "Misskey.io",
    href: "https://misskey.io/@c30",
  },
  {
    title: "Emoji Ranking V2",
    href: "https://er.c30.life/ap/u/c30",
  },
  {
    title: "Bluesky",
    href: "https://bsky.app/profile/c30.life",
  },
  {
    title: "Github",
    href: "https://github.com/Zel9278",
  },
  {
    title: "Youtube(archive)",
    href: "https://www.youtube.com/@cedmidiark",
  },
  {
    title: "Niconico",
    href: "https://www.nicovideo.jp/user/40069987",
  },
  {
    title: "Pixiv",
    href: "https://www.pixiv.net/users/71067167",
  },
  {
    title: "Keyoxide",
    href: "https://keyoxide.org/5717936DE6707ABE284ADB9A4C10C121022E422D",
  },
  {
    title: "Keybase",
    href: "https://keybase.io/c30",
  },
  {
    title: "Skeb",
    href: "https://skeb.jp/@c30",
  },
]

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const otherSites: Link[] = [
  {
    title: "Status Page",
    href: "https://status.c30.life",
  },
  {
    title: "Old Homepage",
    href: "https://old.c30.life",
  },
  {
    title: "kusoda.net(クソだね)",
    href: "https://kusoda.net",
  },
  {
    title: "PC Status",
    href: "https://pc-stats.eov2.com",
  },
  {
    title: "PC Status (new)",
    href: "https://pc-status.net",
  },
  {
    title: "Progress Bar for Days Web",
    href: "https://pdays.eov2.com",
  },
  {
    title: "c30のふぁいるさあばあ",
    href: "https://f.c30.life",
  },
  {
    title: "至り来たり宿 モニタリング",
    href: "https://itari-kitari.c30.life",
  },
  {
    title: "Emoji Ranking V2",
    href: "https://er.c30.life",
  },
  {
    title: "炒めて切った野菜ジュース Activity Relay Service",
    href: "https://relay.tools.c30.life",
  },
  {
    title: "炒めて切った野菜ジュースのチャット (Dev)",
    href: "https://chat.dev.c30.life",
  },
]

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const myFediverseServers: Link[] = [
  {
    title: "Misskey.art",
    href: "https://misskey.art",
    image:
      "https://raw.githubusercontent.com/Misskey-art/Assets/main/banner/200x40.png",
    alt: "Misskey.art",
  },
  {
    title: "至り来たり宿（第二期）",
    href: "https://mk.c30.life",
    image: "https://mk.c30.life/files/2d68d53f-1316-4953-86c7-92f88e566620",
    alt: "至り来たり宿（第二期）",
  },
]

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const mutualLinks: Link[] = [
  {
    title: "hi there (assault1892)",
    href: "https://assault1892.boats",
    image: "https://assault1892.boats/banner/assault1892.png",
    alt: "あさるとのホームページ",
  },
  {
    title: "fuck cloudflare (assault1892)",
    href: "https://assault1892.boats/fuck",
    image: "https://assault1892.boats/banner/fuckcloudflare.png",
    alt: "あさるとのホームページ",
  },
  {
    title: "kazukazu123123",
    href: "https://kazu123.net",
    image: "https://kazu123.net/banner.png",
    alt: "かずかずのホームページ",
  },
  {
    title: "デデオチャンのホームページ",
    href: "https://deryck2000.jp.eu.org/",
    image:
      "https://deryck2000.jp.eu.org/assets/banner/deryck_banner_200_40.png",
    alt: "デデオチャンのホームページ",
  },
  {
    title: "垂紡町",
    href: "https://suiboutown.tumblr.com/",
    image:
      "https://files.misskey.art//fd270cc0-02e3-49ad-9351-c247f5a466a5.png",
    alt: "さんめさんのホームページ",
  },
  {
    title: "Lamp",
    href: "https://lamp.wtf",
    image: null,
    alt: "ランプのホームページ",
  },
]
</script>

<template>
  <!-- Contacts Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      Contacts
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <a
        v-for="link in contacts"
        :key="link.title"
        :href="link.href"
        class="group relative px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 text-center"
      >
        <span
          class="text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
        >
          {{ link.title }}
        </span>
      </a>
    </div>
  </div>

  <!-- Socials Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      Socials
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <a
        v-for="link in socialLinks"
        :key="link.title"
        :href="link.href"
        class="group relative px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 text-center"
      >
        <span
          class="text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
        >
          {{ link.title }}
        </span>
      </a>
    </div>
  </div>

  <!-- Others Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      Others
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <a
        v-for="link in otherSites"
        :key="link.title"
        :href="link.href"
        class="group relative px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 text-center"
      >
        <span
          class="text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
        >
          {{ link.title }}
        </span>
      </a>
    </div>
  </div>

  <!-- My Fediverse Servers Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      My Fediverse Servers
    </h3>
    <div class="flex flex-wrap gap-4">
      <template v-for="link in myFediverseServers" :key="link.title">
        <a
          :href="link.href"
          class="group inline-block p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
        >
          <template v-if="link.image">
            <img
              :src="link.image || ''"
              :alt="link.alt"
              width="200"
              height="40"
              class="h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </template>
          <template v-else>
            <div class="text-center text-neutral-300 font-medium px-4">
              {{ link.title }}
            </div>
          </template>
        </a>
      </template>
    </div>
  </div>

  <!-- Reciprocal Link Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      Reciprocal Links
    </h3>
    <div class="flex flex-wrap gap-4">
      <template v-for="link in mutualLinks" :key="link.title">
        <a
          :href="link.href"
          class="group inline-block p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
        >
          <template v-if="link.image">
            <img
              :src="link.image || ''"
              :alt="link.alt"
              width="200"
              height="40"
              class="h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </template>
          <template v-else>
            <div class="text-center text-neutral-300 font-medium px-4">
              {{ link.title }}
            </div>
          </template>
        </a>
      </template>
    </div>
  </div>

  <!-- My Banner Section -->
  <div>
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      My Banner
    </h3>
    <div class="flex flex-wrap gap-4">
      <a
        href="https://c30.life"
        target="_blank"
        class="group inline-block p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
      >
        <img
          src="/c30-life-banner.png"
          alt="ホームページ"
          width="234"
          height="60"
          class="h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </a>
      <a
        href="https://c30.life"
        target="_blank"
        class="group inline-block p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
      >
        <img
          src="/c30-life-banner-2.png"
          alt="ホームページ"
          width="234"
          height="60"
          class="h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </a>
    </div>
  </div>
</template>
