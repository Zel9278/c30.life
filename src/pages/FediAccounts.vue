<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import {
  type FediverseAccount,
  type FediversePlatform,
  fediverseSections,
  mainFediverseAccounts,
} from "../../fediverseLinks.ts"
import FediAccountCard from "../components/FediAccountCard.vue"

type Platform = FediversePlatform
type AccountData = {
  name?: string
  display_name?: string
  username?: string
  acct?: string
  avatarUrl?: string
  avatar?: string
  notesCount?: number
  statuses_count?: number
}
type MetaData = { name?: string; version?: string; software?: string }
type AccountState = {
  account: FediverseAccount
  data: AccountData | null
  meta: MetaData | null
  loading: boolean
  error: boolean
}
const mainAccounts = mainFediverseAccounts
const sections = fediverseSections
const entries = computed(() => [
  ...mainAccounts.map((account) => ({
    platform: "misskey" as Platform,
    account,
  })),
  ...sections.flatMap((section) =>
    section.accounts.map((account) => ({
      platform: section.platform,
      account,
    })),
  ),
])
// 最初の描画から entries と同じ数・同じ順番の state を用意しておく
// (onMounted で入れると、初回描画で FediAccountCard に undefined が渡って落ちる)
const states = ref<AccountState[]>(
  entries.value.map(({ account }) => ({
    account,
    data: null,
    meta: null,
    loading: true,
    error: false,
  })),
)
const cache = new Map<string, Promise<AccountData | null>>()
const metaCache = new Map<string, Promise<MetaData | null>>()
const totalPosts = computed(() =>
  states.value.reduce(
    (total, state) =>
      total + (state.data?.notesCount ?? state.data?.statuses_count ?? 0),
    0,
  ),
)

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

async function fetchMeta(
  platform: Platform,
  host: string,
): Promise<MetaData | null> {
  const key = `meta:${platform}:${host}`
  const cached = metaCache.get(key)
  if (cached) return cached
  const request = (async () => {
    try {
      if (platform === "misskey" || platform === "mk-go") {
        const response = await fetch("/api/misskey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            host,
            endpoint: "meta",
            body: { detail: false },
          }),
        })
        if (!response.ok) return null
        const data = (await response.json()) as {
          name?: string
          version?: string
        }
        return {
          name: data.name,
          version: data.version,
          software: "Misskey",
        } as MetaData
      }
      const response = await fetch(
        `/api/mastodon?host=${encodeURIComponent(host)}&endpoint=instance`,
      )
      if (!response.ok) return null
      const data = (await response.json()) as {
        title?: string
        version?: string
      }
      return { name: data.title, version: data.version } as MetaData
    } catch {
      return null
    }
  })()
  metaCache.set(key, request)
  return request
}

async function fetchAccount(
  platform: Platform,
  account: FediverseAccount,
): Promise<AccountData | null> {
  const key = `${platform}:${account.host}:${account.userId}`
  const cached = cache.get(key)
  if (cached) return cached
  const request = (async () => {
    try {
      if (platform === "misskey" || platform === "mk-go") {
        const response = await fetch("/api/misskey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            host: account.host,
            endpoint: "users/show",
            body: { username: account.userId, host: null },
          }),
        })
        if (!response.ok) return null
        return (await response.json()) as AccountData
      }
      const endpoint = `accounts/lookup?acct=${encodeURIComponent(account.userId)}`
      const response = await fetch(
        `/api/mastodon?host=${encodeURIComponent(account.host)}&endpoint=${encodeURIComponent(endpoint)}`,
      )
      if (!response.ok) return null
      return (await response.json()) as AccountData
    } catch {
      return null
    }
  })()
  cache.set(key, request)
  return request
}

onMounted(() => {
  entries.value.forEach(({ platform, account }, index) => {
    void Promise.all([
      fetchAccount(platform, account),
      fetchMeta(platform, account.host),
    ]).then(([data, meta]) => {
      const state = states.value[index]
      if (!state) return
      state.data = data
      state.meta = meta
      state.loading = false
      state.error = !data
    })
  })
})

function stateFor(platform: Platform, account: FediverseAccount) {
  const index = entries.value.findIndex(
    (entry) =>
      entry.platform === platform &&
      entry.account.host === account.host &&
      entry.account.userId === account.userId,
  )
  return states.value[index]
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl">
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Fedi Accounts</h1>
      <p class="text-neutral-400 text-sm mb-6">
        Fediverseのアカウント一覧（{{ entries.length }}件） · 合計投稿数:
        <span class="text-white font-medium">{{ formatNumber(totalPosts) }}</span>
      </p>

      <h2 class="text-xl font-bold text-white mb-4">メインアカウント</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div v-for="(entry, index) in entries.slice(0, mainAccounts.length)" :key="`${entry.account.host}-${entry.account.userId}`" class="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700">
          <FediAccountCard :state="states[index]" :platform="entry.platform" large />
        </div>
      </div>

        <template v-for="section in sections" :key="section.title">
          <details v-if="section.accounts.length" class="group mb-5">
        <summary class="cursor-pointer list-none text-xl font-bold text-white flex items-center gap-2 py-2">
          <span class="transition-transform group-open:rotate-90">›</span>{{ section.title }}
          <span class="text-sm font-normal text-neutral-500">({{ section.accounts.length }})</span>
        </summary>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
          <div v-for="account in section.accounts" :key="`${section.platform}-${account.host}-${account.userId}`" class="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700">
            <FediAccountCard :state="stateFor(section.platform, account)" :platform="section.platform" />
          </div>
        </div>
          </details>
        </template>
    </div>
  </section>
</template>
