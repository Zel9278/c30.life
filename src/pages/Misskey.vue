<script setup lang="ts">
import { ref, onMounted, computed } from "vue"

type UserData = {
  host: string
  userId: string
  isNSFW?: boolean
}

type AccountData = {
  name: string
  username: string
  description: string
  avatarUrl: string
  notesCount: number
  followingCount: number
  followersCount: number
}

type MetaData = {
  name: string
  iconUrl: string
  version: string
  disableRegistration: boolean
}

type AccountState = {
  user: UserData
  account: AccountData | null
  meta: MetaData | null
  loading: boolean
  error: boolean
}

const mainUsedUsers: UserData[] = [
  { host: "mk.c30.life", userId: "c30" },
  { host: "misskey.art", userId: "c30" },
]

const users: UserData[] = [
  { host: "eth.rumiserver.com", userId: "c30" },
  { host: "msky.haibala.com", userId: "c30" },
  { host: "misskey.systems", userId: "c30" },
  { host: "premis.one", userId: "c30" },
  { host: "ddoskey.com", userId: "c30" },
  { host: "oekakiskey.com", userId: "c30" },
  { host: "nijimiss.moe", userId: "c30" },
  { host: "otoskey.tarbin.net", userId: "c30" },
  { host: "novelskey.tarbin.net", userId: "c30" },
  { host: "mk.absturztau.be", userId: "c30" },
  { host: "kokt.club", userId: "c30" },
  { host: "nekomiya.net", userId: "c30" },
  { host: "minazukey.uk", userId: "c30" },
  { host: "misskey.7ka.org", userId: "c30" },
  { host: "misskey.io", userId: "c30" },
  { host: "misskey.flowers", userId: "c30" },
  { host: "mk.shrimpia.network", userId: "c30" },
  { host: "misskey.m544.net", userId: "c30" },
  { host: "misskey.04.si", userId: "c30" },
  { host: "submarin.online", userId: "c30" },
  { host: "p1.a9z.dev", userId: "ez" },
  { host: "mi.cbrx.io", userId: "c30" },
  { host: "sushi.ski", userId: "c30" },
  { host: "k.lapy.link", userId: "c30" },
  { host: "misskey.life", userId: "c30" },
  { host: "misskey.noellabo.jp", userId: "c30" },
  { host: "voskey.icalo.net", userId: "c30" },
  { host: "misskey.yukineko.me", userId: "c30" },
  { host: "misskey.cloud", userId: "c30" },
  { host: "misskey.gg", userId: "c30" },
  { host: "misskey.design", userId: "c30" },
  { host: "soukun.io", userId: "c", isNSFW: true },
  { host: "45sukey.net", userId: "c30", isNSFW: true },
]

const mainAccountStates = ref<AccountState[]>([])
const otherAccountStates = ref<AccountState[]>([])

const totalCount = computed(() => mainUsedUsers.length + users.length)

async function fetchAccount(
  host: string,
  userId: string,
): Promise<AccountData | null> {
  try {
    const response = await fetch("/api/misskey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        endpoint: "users/show",
        body: { username: userId, host: null },
      }),
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function fetchMeta(host: string): Promise<MetaData | null> {
  try {
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
    return await response.json()
  } catch {
    return null
  }
}

async function loadAccount(user: UserData, states: typeof mainAccountStates) {
  const index = states.value.findIndex(
    (s) => s.user.host === user.host && s.user.userId === user.userId,
  )
  if (index === -1) return

  states.value[index].loading = true

  const [account, meta] = await Promise.all([
    fetchAccount(user.host, user.userId),
    fetchMeta(user.host),
  ])

  states.value[index].account = account
  states.value[index].meta = meta
  states.value[index].loading = false
  states.value[index].error = !account
}

onMounted(() => {
  // Initialize states
  mainAccountStates.value = mainUsedUsers.map((user) => ({
    user,
    account: null,
    meta: null,
    loading: true,
    error: false,
  }))

  otherAccountStates.value = users.map((user) => ({
    user,
    account: null,
    meta: null,
    loading: true,
    error: false,
  }))

  // Load all accounts
  mainUsedUsers.forEach((user) => loadAccount(user, mainAccountStates))
  users.forEach((user) => loadAccount(user, otherAccountStates))
})

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        Misskey Accounts
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        入ってるサーバーの数: {{ totalCount }}
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Main Accounts -->
      <h2 class="text-xl font-bold text-white mb-4">メインアカウント</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          v-for="state in mainAccountStates"
          :key="`${state.user.host}-${state.user.userId}`"
          class="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700"
        >
          <!-- Loading State -->
          <div v-if="state.loading" class="animate-pulse">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-neutral-700 rounded-full" />
              <div class="flex-1">
                <div class="h-4 bg-neutral-700 rounded w-3/4 mb-2" />
                <div class="h-3 bg-neutral-700 rounded w-1/2" />
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="state.error" class="text-center py-4">
            <p class="text-red-400">読み込みエラー</p>
            <p class="text-neutral-500 text-sm">
              @{{ state.user.userId }}@{{ state.user.host }}
            </p>
          </div>

          <!-- Account Card -->
          <div v-else class="flex items-start gap-4">
            <a
              :href="`https://${state.user.host}/@${state.user.userId}`"
              target="_blank"
              class="shrink-0"
            >
              <img
                v-if="state.account?.avatarUrl"
                :src="state.account.avatarUrl"
                :alt="state.account?.name || state.user.userId"
                class="w-16 h-16 rounded-full object-cover border-2 border-neutral-600 hover:border-green-500 transition-colors"
              />
              <div
                v-else
                class="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center"
              >
                <span class="text-2xl">🦊</span>
              </div>
            </a>
            <div class="flex-1 min-w-0">
              <a
                :href="`https://${state.user.host}/@${state.user.userId}`"
                target="_blank"
                class="font-bold text-white hover:text-green-400 transition-colors line-clamp-1"
                v-html="state.account?.name || state.user.userId"
              />
              <p class="text-green-400 text-sm">
                @{{ state.account?.username || state.user.userId }}@{{
                  state.user.host
                }}
              </p>
              <div class="flex gap-4 mt-2 text-xs text-neutral-400">
                <span
                  >Notes:
                  {{ formatNumber(state.account?.notesCount || 0) }}</span
                >
                <span
                  >Following:
                  {{ formatNumber(state.account?.followingCount || 0) }}</span
                >
                <span
                  >Followers:
                  {{ formatNumber(state.account?.followersCount || 0) }}</span
                >
              </div>
              <div v-if="state.meta" class="mt-2 text-xs">
                <span
                  :class="
                    state.meta.disableRegistration
                      ? 'text-red-400'
                      : 'text-lime-400'
                  "
                >
                  {{ state.meta.name }}
                </span>
                <span class="text-neutral-500 ml-2"
                  >v{{ state.meta.version }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-neutral-700 w-full h-0.5 rounded my-6" />

      <!-- Other Accounts -->
      <h2 class="text-xl font-bold text-white mb-4">その他のアカウント</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="state in otherAccountStates"
          :key="`${state.user.host}-${state.user.userId}`"
          class="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700"
          :class="{
            'blur-sm hover:blur-none transition-all': state.user.isNSFW,
          }"
        >
          <!-- Loading State -->
          <div v-if="state.loading" class="animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-neutral-700 rounded-full" />
              <div class="flex-1">
                <div class="h-3 bg-neutral-700 rounded w-3/4 mb-2" />
                <div class="h-2 bg-neutral-700 rounded w-1/2" />
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="state.error" class="text-center py-2">
            <p class="text-red-400 text-sm">読み込みエラー</p>
            <p class="text-neutral-500 text-xs">
              @{{ state.user.userId }}@{{ state.user.host }}
            </p>
          </div>

          <!-- Account Card -->
          <div v-else class="flex items-start gap-3">
            <a
              :href="`https://${state.user.host}/@${state.user.userId}`"
              target="_blank"
              class="shrink-0"
            >
              <img
                v-if="state.account?.avatarUrl"
                :src="state.account.avatarUrl"
                :alt="state.account?.name || state.user.userId"
                class="w-12 h-12 rounded-full object-cover border-2 border-neutral-600 hover:border-green-500 transition-colors"
              />
              <div
                v-else
                class="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center"
              >
                <span class="text-xl">🦊</span>
              </div>
            </a>
            <div class="flex-1 min-w-0">
              <a
                :href="`https://${state.user.host}/@${state.user.userId}`"
                target="_blank"
                class="font-bold text-white hover:text-green-400 transition-colors text-sm line-clamp-1"
                v-html="state.account?.name || state.user.userId"
              />
              <p class="text-green-400 text-xs truncate">
                @{{ state.account?.username || state.user.userId }}@{{
                  state.user.host
                }}
              </p>
              <div class="flex gap-2 mt-1 text-xs text-neutral-400">
                <span
                  >{{
                    formatNumber(state.account?.notesCount || 0)
                  }}
                  notes</span
                >
              </div>
              <div v-if="state.meta" class="mt-1 text-xs">
                <span
                  :class="
                    state.meta.disableRegistration
                      ? 'text-red-400'
                      : 'text-lime-400'
                  "
                  class="truncate block"
                >
                  {{ state.meta.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
