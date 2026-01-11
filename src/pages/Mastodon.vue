<script setup lang="ts">
import { ref, onMounted, computed } from "vue"

type UserData = {
  host: string
  userId: string
  isNSFW?: boolean
  isPleroma?: boolean
}

type AccountData = {
  display_name: string
  username: string
  note: string
  avatar: string
  followers_count: number
  following_count: number
  statuses_count: number
}

type MetaData = {
  title: string
  version: string
  registrations: boolean
}

type AccountState = {
  user: UserData
  account: AccountData | null
  meta: MetaData | null
  loading: boolean
  error: boolean
}

const mastodonUsers: UserData[] = [
  { host: "fedibird.com", userId: "c30" },
  { host: "mstdn.jp", userId: "clive64" },
  { host: "mastodon.art", userId: "c30" },
]

const pleromaUsers: UserData[] = [
  { host: "blob.cat", userId: "c30", isPleroma: true },
  { host: "fedi.absturztau.be", userId: "c30", isPleroma: true },
  { host: "post.syobon.net", userId: "c30", isPleroma: true },
  { host: "pr.c30.life", userId: "c30", isPleroma: true },
]

const mastodonAccountStates = ref<AccountState[]>([])
const pleromaAccountStates = ref<AccountState[]>([])

const totalCount = computed(() => mastodonUsers.length + pleromaUsers.length)

async function fetchAccount(
  host: string,
  userId: string,
): Promise<AccountData | null> {
  try {
    const response = await fetch(
      `/api/mastodon?host=${encodeURIComponent(host)}&endpoint=${encodeURIComponent(`accounts/lookup?acct=${userId}`)}`,
    )
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function fetchMeta(host: string): Promise<MetaData | null> {
  try {
    const response = await fetch(
      `/api/mastodon?host=${encodeURIComponent(host)}&endpoint=instance`,
    )
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function loadAccount(
  user: UserData,
  states: typeof mastodonAccountStates,
) {
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
  mastodonAccountStates.value = mastodonUsers.map((user) => ({
    user,
    account: null,
    meta: null,
    loading: true,
    error: false,
  }))

  pleromaAccountStates.value = pleromaUsers.map((user) => ({
    user,
    account: null,
    meta: null,
    loading: true,
    error: false,
  }))

  // Load all accounts
  mastodonUsers.forEach((user) => loadAccount(user, mastodonAccountStates))
  pleromaUsers.forEach((user) => loadAccount(user, pleromaAccountStates))
})

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function getProfileUrl(user: UserData): string {
  const prefix = user.isPleroma ? "" : "@"
  return `https://${user.host}/${prefix}${user.userId}`
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        Mastodon Accounts
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        入ってるサーバーの数: {{ totalCount }}
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Mastodon Accounts -->
      <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"
          />
        </svg>
        Mastodon
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          v-for="state in mastodonAccountStates"
          :key="`${state.user.host}-${state.user.userId}`"
          class="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700"
          :class="{
            'blur-sm hover:blur-none transition-all': state.user.isNSFW,
          }"
        >
          <!-- Loading State -->
          <div v-if="state.loading" class="animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 bg-neutral-700 rounded-full" />
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
          <div v-else class="flex items-start gap-3">
            <a
              :href="getProfileUrl(state.user)"
              target="_blank"
              class="shrink-0"
            >
              <img
                v-if="state.account?.avatar"
                :src="state.account.avatar"
                :alt="state.account?.display_name || state.user.userId"
                class="w-14 h-14 rounded-full object-cover border-2 border-neutral-600 hover:border-purple-500 transition-colors"
              />
              <div
                v-else
                class="w-14 h-14 bg-neutral-700 rounded-full flex items-center justify-center"
              >
                <span class="text-2xl">🐘</span>
              </div>
            </a>
            <div class="flex-1 min-w-0">
              <a
                :href="getProfileUrl(state.user)"
                target="_blank"
                class="font-bold text-white hover:text-purple-400 transition-colors line-clamp-1"
              >
                {{ state.account?.display_name || state.user.userId }}
              </a>
              <p class="text-purple-400 text-sm truncate">
                @{{ state.account?.username || state.user.userId }}@{{
                  state.user.host
                }}
              </p>
              <div class="flex gap-3 mt-2 text-xs text-neutral-400">
                <span
                  >{{
                    formatNumber(state.account?.statuses_count || 0)
                  }}
                  posts</span
                >
                <span
                  >{{
                    formatNumber(state.account?.following_count || 0)
                  }}
                  following</span
                >
                <span
                  >{{
                    formatNumber(state.account?.followers_count || 0)
                  }}
                  followers</span
                >
              </div>
              <div v-if="state.meta" class="mt-2 text-xs">
                <span
                  :class="
                    state.meta.registrations ? 'text-lime-400' : 'text-red-400'
                  "
                >
                  {{ state.meta.title }}
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

      <!-- Pleroma/Akkoma Accounts -->
      <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M8 12h8M12 8v8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Pleroma / Akkoma
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="state in pleromaAccountStates"
          :key="`${state.user.host}-${state.user.userId}`"
          class="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700"
          :class="{
            'blur-sm hover:blur-none transition-all': state.user.isNSFW,
          }"
        >
          <!-- Loading State -->
          <div v-if="state.loading" class="animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 bg-neutral-700 rounded-full" />
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
          <div v-else class="flex items-start gap-3">
            <a
              :href="getProfileUrl(state.user)"
              target="_blank"
              class="shrink-0"
            >
              <img
                v-if="state.account?.avatar"
                :src="state.account.avatar"
                :alt="state.account?.display_name || state.user.userId"
                class="w-14 h-14 rounded-full object-cover border-2 border-neutral-600 hover:border-orange-500 transition-colors"
              />
              <div
                v-else
                class="w-14 h-14 bg-neutral-700 rounded-full flex items-center justify-center"
              >
                <span class="text-2xl">🦊</span>
              </div>
            </a>
            <div class="flex-1 min-w-0">
              <a
                :href="getProfileUrl(state.user)"
                target="_blank"
                class="font-bold text-white hover:text-orange-400 transition-colors line-clamp-1"
              >
                {{ state.account?.display_name || state.user.userId }}
              </a>
              <p class="text-orange-400 text-sm truncate">
                @{{ state.account?.username || state.user.userId }}@{{
                  state.user.host
                }}
              </p>
              <div class="flex gap-3 mt-2 text-xs text-neutral-400">
                <span
                  >{{
                    formatNumber(state.account?.statuses_count || 0)
                  }}
                  posts</span
                >
                <span
                  >{{
                    formatNumber(state.account?.following_count || 0)
                  }}
                  following</span
                >
                <span
                  >{{
                    formatNumber(state.account?.followers_count || 0)
                  }}
                  followers</span
                >
              </div>
              <div v-if="state.meta" class="mt-2 text-xs">
                <span
                  :class="
                    state.meta.registrations ? 'text-lime-400' : 'text-red-400'
                  "
                >
                  {{ state.meta.title }}
                </span>
                <span class="text-neutral-500 ml-2"
                  >v{{ state.meta.version }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
