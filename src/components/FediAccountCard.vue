<script setup lang="ts">
import type { FediverseAccount } from "../../fediverseLinks"

type Platform = "misskey" | "mk-go" | "mastodon" | "pleroma" | "mitra" | "pixelfed"
type AccountData = {
  name?: string
  display_name?: string
  username?: string
  acct?: string
  avatarUrl?: string
  avatar?: string
  url?: string
  notesCount?: number
  statuses_count?: number
}
type MetaData = { name?: string; version?: string }
type AccountState = { account: FediverseAccount; data: AccountData | null; meta: MetaData | null; loading: boolean; error: boolean }

defineProps<{ state: AccountState; platform: Platform; large?: boolean }>()

function formatNumber(value: number): string {
  return value.toLocaleString()
}
</script>

<template>
  <div v-if="state.loading" class="animate-pulse h-14 bg-neutral-700 rounded" />
  <p v-else-if="state.error" class="text-red-400 text-sm">読み込みエラー</p>
  <a
    v-else
    :href="state.data?.url || (platform === 'misskey' ? `https://${state.account.host}/@${state.account.userId}` : `https://${state.account.host}/${state.account.profilePrefix === 'plain' ? '' : '@'}${state.account.userId}`)"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-start gap-3"
  >
    <img
      v-if="state.data?.avatarUrl || state.data?.avatar"
      :src="state.data.avatarUrl || state.data.avatar"
      :alt="state.data.name || state.data.display_name || state.data.username || state.account.userId"
      :class="large ? 'w-16 h-16' : 'w-12 h-12'"
      class="rounded-full object-cover shrink-0"
    />
    <div
      v-else
      :class="large ? 'w-16 h-16' : 'w-12 h-12'"
      class="rounded-full bg-neutral-700 shrink-0"
    />
    <div class="min-w-0">
      <p class="font-bold text-white truncate">
        {{ state.data?.name || state.data?.display_name || state.data?.username || state.account.userId }}
      </p>
      <p class="text-purple-400 text-sm truncate">
        @{{ state.data?.acct || state.data?.username || state.account.userId }}@{{ state.account.host }}
      </p>
      <p class="text-xs text-neutral-500 mt-1">
        {{ formatNumber(state.data?.notesCount ?? state.data?.statuses_count ?? 0) }} posts
      </p>
      <p v-if="state.meta?.name" class="text-xs text-neutral-600 mt-0.5 truncate">
        {{ state.meta.name }}<span v-if="state.meta.version" class="ml-1">v{{ state.meta.version }}</span>
      </p>
    </div>
  </a>
</template>
