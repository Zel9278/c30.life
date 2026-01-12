<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
  title: string
  url: string
}>()

const misskeyURL = ref("")
const mastodonURL = ref("")
const dialogRef = ref<HTMLDialogElement | null>(null)

const text = () => encodeURIComponent(`${props.title} ${props.url}`)

const openDialog = () => {
  dialogRef.value?.showModal()
}

const shareToMisskey = () => {
  if (!misskeyURL.value) return
  window.open(
    `https://${misskeyURL.value}/share?text=${text()}&visibility=public&localOnly=0`,
    "_blank",
  )
  misskeyURL.value = ""
}

const shareToMastodon = () => {
  if (!mastodonURL.value) return
  window.open(`https://${mastodonURL.value}/share?text=${text()}`, "_blank")
  mastodonURL.value = ""
}

const closeDialog = () => {
  dialogRef.value?.close()
}

defineExpose({ openDialog })
</script>

<template>
  <button
    type="button"
    class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
    @click="openDialog"
  >
    Share to Fediverse
  </button>

  <Teleport to="body">
    <dialog ref="dialogRef" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-neutral-900 border border-neutral-700">
        <h3 class="font-bold text-lg text-white mb-4">Share to Fediverse</h3>

        <!-- Misskey -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-neutral-300 mb-2">
            Misskey
          </label>
          <div class="flex gap-2">
            <input
              v-model="misskeyURL"
              type="text"
              placeholder="misskey.io"
              class="input input-bordered input-accent flex-1 bg-neutral-800 border-neutral-600 text-white placeholder-neutral-500"
              @keyup.enter="shareToMisskey"
            />
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!misskeyURL"
              @click="shareToMisskey"
            >
              Share
            </button>
          </div>
          <p class="text-xs text-neutral-500 mt-1">
            例: misskey.io, misskey.art
          </p>
        </div>

        <!-- Mastodon -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-neutral-300 mb-2">
            Mastodon
          </label>
          <div class="flex gap-2">
            <input
              v-model="mastodonURL"
              type="text"
              placeholder="mastodon.social"
              class="input input-bordered input-accent flex-1 bg-neutral-800 border-neutral-600 text-white placeholder-neutral-500"
              @keyup.enter="shareToMastodon"
            />
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!mastodonURL"
              @click="shareToMastodon"
            >
              Share
            </button>
          </div>
          <p class="text-xs text-neutral-500 mt-1">
            例: mastodon.social, fedibird.com
          </p>
        </div>

        <div class="modal-action">
          <button type="button" class="btn" @click="closeDialog">閉じる</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  </Teleport>
</template>
