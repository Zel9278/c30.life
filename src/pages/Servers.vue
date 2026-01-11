<script setup lang="ts">
type Status = "gone" | "active" | "unknown"
type Softwares =
  | "Misskey"
  | "Misskey Tempura"
  | "Akkoma"
  | "Foundkey"
  | "Calckey"
  | "Dolphin"
  | "GotoSocial"
  | "Mastodon"
  | "Simkey"
  | "Firefish"
  | "Pleroma"

type Server = {
  name: string
  url: string
  software: Softwares
  created_at: string
  status: Status
}

const statusColors: Record<Status, string> = {
  gone: "text-red-500",
  active: "text-green-500",
  unknown: "text-gray-500",
}

const softwares: Record<Softwares, string> = {
  Misskey: "https://github.com/misskey-dev/misskey",
  "Misskey Tempura": "https://github.com/lqvp/misskey-tempura",
  Akkoma: "https://akkoma.dev/AkkomaGang/akkoma",
  Foundkey: "https://akkoma.dev/FoundKeyGang/FoundKey",
  Calckey: "https://codeberg.org/calckey/calckey",
  Dolphin: "https://github.com/misskey-dev/dolphin",
  GotoSocial: "https://github.com/superseriousbusiness/gotosocial",
  Mastodon: "https://github.com/mastodon/mastodon",
  Simkey: "https://github.com/sim1222/misskey",
  Firefish: "https://git.joinfirefish.org/firefish/firefish.git",
  Pleroma: "https://git.pleroma.social/pleroma/pleroma",
}

const bigServers: Server[] = [
  {
    name: "Misskeyをしよう",
    url: "https://mi-wo.site",
    software: "Misskey",
    created_at: "2022-12-24",
    status: "gone",
  },
  {
    name: "Beta Misskeyをしよう",
    url: "https://beta.mi-wo.site",
    software: "Misskey",
    created_at: "2022-12-28",
    status: "gone",
  },
  {
    name: "Misskey.art",
    url: "https://misskey.art",
    software: "Misskey",
    created_at: "2023-02-06",
    status: "active",
  },
]

const privateServers: Server[] = [
  {
    name: "csys misskey鯖",
    url: "https://misskey.csys64.com/",
    software: "Misskey",
    created_at: "2022-11-24",
    status: "gone",
  },
  {
    name: "misskey kusoda.net店",
    url: "https://social.kusoda.net/",
    software: "Misskey",
    created_at: "2022-11-27",
    status: "gone",
  },
  {
    name: "せどすきー",
    url: "https://mi.eox2.com",
    software: "Misskey",
    created_at: "2022-12-22",
    status: "gone",
  },
  {
    name: "せどすきー",
    url: "https://m.c30.life",
    software: "Misskey",
    created_at: "2023-03-30",
    status: "gone",
  },
  {
    name: "せどこま",
    url: "https://a.c30.life",
    software: "Akkoma",
    created_at: "2023-05-27",
    status: "gone",
  },
  {
    name: "せどくっきー",
    url: "https://ck.c30.life",
    software: "Calckey",
    created_at: "2023-05-28",
    status: "gone",
  },
  {
    name: "せどぴん",
    url: "https://d.c30.life",
    software: "Dolphin",
    created_at: "2023-05-31",
    status: "gone",
  },
  {
    name: "GS30",
    url: "https://gs.c30.life",
    software: "GotoSocial",
    created_at: "2023-06-09",
    status: "gone",
  },
  {
    name: "せどん",
    url: "https://md.c30.life",
    software: "Mastodon",
    created_at: "2023-06-10",
    status: "gone",
  },
  {
    name: "せしむ",
    url: "https://sk.c30.life",
    software: "Simkey",
    created_at: "2023-06-10",
    status: "gone",
  },
  {
    name: "何かものすごく木月ってるサーバー",
    url: "https://kizzkey.cloud",
    software: "Firefish",
    created_at: "2023-07-09",
    status: "gone",
  },
  {
    name: "ab62",
    url: "https://ab62.icu",
    software: "Misskey",
    created_at: "2023-07-22",
    status: "gone",
  },
  {
    name: "_",
    url: "https://_c30.life",
    software: "Firefish",
    created_at: "2023-??-??",
    status: "gone",
  },
  {
    name: "木月のようなそうでもない地下にあるすごくもないサーバー",
    url: "https://shelter.kizzkey.cloud",
    software: "Firefish",
    created_at: "2023-09-05",
    status: "gone",
  },
  {
    name: "木月 Misskey",
    url: "https://mi.kizzkey.cloud",
    software: "Misskey",
    created_at: "2023-09-17",
    status: "gone",
  },
  {
    name: "木月 Foundkey",
    url: "https://fk.kizzkey.cloud",
    software: "Foundkey",
    created_at: "2023-09-25",
    status: "gone",
  },
  {
    name: "なんかものすごい木月ではなさそうな鯖へ来た感じのそういうあれみたいな...",
    url: "https://gts.kizzkey.cloud",
    software: "GotoSocial",
    created_at: "2023-09-28",
    status: "gone",
  },
  {
    name: "木月 Mastodon店",
    url: "https://mstdn.kizzkey.cloud",
    software: "Mastodon",
    created_at: "2023-09-29",
    status: "gone",
  },
  {
    name: "木月 Pleroma店",
    url: "https://ple.kizzkey.cloud",
    software: "Pleroma",
    created_at: "2023-09-30",
    status: "gone",
  },
  {
    name: "tro鯖",
    url: "https://tro9.life",
    software: "Firefish",
    created_at: "2023-10-07",
    status: "gone",
  },
  {
    name: "tty7",
    url: "https://p.tty7.uk",
    software: "Pleroma",
    created_at: "2023-11-??",
    status: "gone",
  },
  {
    name: "至り来たり宿",
    url: "https://m.tty7.uk",
    software: "Misskey",
    created_at: "2024-01-05",
    status: "gone",
  },
  {
    name: "至り来たり宿（第二期）",
    url: "https://mk.c30.life",
    software: "Misskey Tempura",
    created_at: "2024-05-22",
    status: "active",
  },
]

const sponsoringServers: Server[] = [
  {
    name: "腋すきー",
    url: "https://soukun.xyz",
    software: "Foundkey",
    created_at: "2023-06-02",
    status: "gone",
  },
  {
    name: "腋すきー",
    url: "https://soukun.io",
    software: "Misskey",
    created_at: "2023-08-12",
    status: "active",
  },
]
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        My Fediverse Servers
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        c30が関わったFediverseサーバーの一覧
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 mb-4 text-sm">
        <span class="text-gray-500">● Unknown</span>
        <span class="text-red-500">● Gone済み</span>
        <span class="text-green-500">● 稼働中</span>
      </div>

      <!-- Big Servers -->
      <h2 class="text-lg font-semibold text-white mb-2">大型鯖</h2>
      <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead class="bg-neutral-800 text-neutral-200">
            <tr>
              <th class="py-2 px-3 text-left">名前</th>
              <th class="py-2 px-3 text-left">URL</th>
              <th class="py-2 px-3 text-left">ソフトウェア</th>
              <th class="py-2 px-3 text-left">作成日</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="server in bigServers"
              :key="server.url"
              class="border-b border-neutral-700"
              :class="statusColors[server.status]"
            >
              <td class="py-2 px-3">{{ server.name }}</td>
              <td class="py-2 px-3">
                <template v-if="server.status === 'gone'">
                  {{ server.url }} (アクセスしないでください)
                </template>
                <a
                  v-else
                  :href="server.url"
                  target="_blank"
                  class="underline hover:text-sky-400"
                >
                  {{ server.url }}
                </a>
              </td>
              <td class="py-2 px-3">
                <a
                  :href="softwares[server.software]"
                  target="_blank"
                  class="underline hover:text-sky-400"
                >
                  {{ server.software }}
                </a>
              </td>
              <td class="py-2 px-3">{{ server.created_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Private Servers -->
      <h2 class="text-lg font-semibold text-white mb-2">個人鯖</h2>
      <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead class="bg-neutral-800 text-neutral-200">
            <tr>
              <th class="py-2 px-3 text-left">名前</th>
              <th class="py-2 px-3 text-left">URL</th>
              <th class="py-2 px-3 text-left">ソフトウェア</th>
              <th class="py-2 px-3 text-left">作成日</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="server in privateServers"
              :key="server.url"
              class="border-b border-neutral-700"
              :class="statusColors[server.status]"
            >
              <td class="py-2 px-3">{{ server.name }}</td>
              <td class="py-2 px-3">
                <template v-if="server.status === 'gone'">
                  {{ server.url }} (アクセスしないでください)
                </template>
                <a
                  v-else
                  :href="server.url"
                  target="_blank"
                  class="underline hover:text-sky-400"
                >
                  {{ server.url }}
                </a>
              </td>
              <td class="py-2 px-3">
                <a
                  :href="softwares[server.software]"
                  target="_blank"
                  class="underline hover:text-sky-400"
                >
                  {{ server.software }}
                </a>
              </td>
              <td class="py-2 px-3">{{ server.created_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- sponsoring Servers -->
      <h2 class="text-lg font-semibold text-white mb-2">提供鯖</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-neutral-800 text-neutral-200">
            <tr>
              <th class="py-2 px-3 text-left">名前</th>
              <th class="py-2 px-3 text-left">URL</th>
              <th class="py-2 px-3 text-left">ソフトウェア</th>
              <th class="py-2 px-3 text-left">作成日</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="server in sponsoringServers"
              :key="server.url"
              class="border-b border-neutral-700"
              :class="statusColors[server.status]"
            >
              <td class="py-2 px-3">{{ server.name }}</td>
              <td class="py-2 px-3">
                <template v-if="server.status === 'gone'">
                  {{ server.url }} (アクセスしないでください)
                </template>
                <a
                  v-else
                  :href="server.url"
                  target="_blank"
                  class="underline hover:text-sky-400"
                >
                  {{ server.url }}
                </a>
              </td>
              <td class="py-2 px-3">
                <a
                  :href="softwares[server.software]"
                  target="_blank"
                  class="underline hover:text-sky-400"
                >
                  {{ server.software }}
                </a>
              </td>
              <td class="py-2 px-3">{{ server.created_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
