<script setup lang="ts">
import { onMounted, ref } from "vue"
import {
  mitraAccounts,
  pixelfedAccounts,
  type FediverseAccount,
} from "../../fediverseLinks"

type Account = {
  display_name?: string
  username: string
  acct?: string
  avatar?: string
  url?: string
  followers_count?: number
  following_count?: number
  statuses_count?: number
}

type State = {
  account: FediverseAccount
  data: Account | null
  loading: boolean
  error: boolean
}

const accounts = [
  ...mitraAccounts.map((account) => ({ platform: "Mitra", account })),
  ...pixelfedAccounts.map((account) => ({ platform: "Pixelfed", account })),
]
const states = ref<State[]>(
  accounts.map(({ account }) => ({ account, data: null, loading: true, error: false })),
)

async function loadAccount(
  platform: string,
  account: FediverseAccount,
  state: State,
) {
  try {
    const endpoint = `accounts/lookup?acct=${encodeURIComponent(account.userId)}`
    const response = await fetch(
      `/api/mastodon?host=${encodeURIComponent(account.host)}&endpoint=${encodeURIComponent(endpoint)}`,
    )
    if (!response.ok) throw new Error("Account lookup failed")
    state.data = (await response.json()) as Account
  } catch {
    state.error = true
  } finally {
    state.loading = false
  }
}

onMounted(() => {
  states.value.forEach((state, index) => {
    void loadAccount(accounts[index].platform, state.account, state)
  })
})

function profileUrl(account: FediverseAccount) {
  return `https://${account.host}/${account.profilePrefix === "plain" ? "" : "@"}${account.userId}`
}
</script>

<template>
  <section
    v-if="states.length"
    class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto"
  >
    <div class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl">
      <h2 class="text-xl font-bold text-white mb-4">Mitra / Pixelfed</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(state, index) in states"
          :key="`${accounts[index].platform}-${state.account.host}-${state.account.userId}`"
          class="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700"
        >
          <div v-if="state.loading" class="animate-pulse h-16 bg-neutral-700 rounded" />
          <div v-else-if="state.error" class="text-red-400 text-sm">
            {{ accounts[index].platform }}: 読み込みエラー
          </div>
          <a
            v-else
            :href="state.data?.url || profileUrl(state.account)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3"
          >
            <img
              v-if="state.data?.avatar"
              :src="state.data.avatar"
              :alt="state.data.display_name || state.data.username"
              class="w-14 h-14 rounded-full object-cover"
            />
            <div class="min-w-0">
              <p class="text-xs text-neutral-400">{{ accounts[index].platform }}</p>
              <p class="font-bold text-white truncate">
                {{ state.data?.display_name || state.data?.username || state.account.userId }}
              </p>
              <p class="text-purple-400 text-sm truncate">
                @{{ state.data?.acct || state.data?.username || state.account.userId }}@{{ state.account.host }}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
