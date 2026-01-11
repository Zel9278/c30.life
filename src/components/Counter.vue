<script setup lang="ts">
import { ref, onMounted } from "vue"

type CounterResponse = {
  count: number
}

const count = ref<number | null>(null)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const response = await fetch("/api/counter", {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to fetch counter")
    const data: CounterResponse = await response.json()
    count.value = data.count
  } catch (e) {
    console.error("Counter error:", e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <p v-if="loading" class="text-sm text-neutral-500">カウンター読み込み中...</p>
  <p v-else-if="error" class="text-sm text-red-400">
    カウンターの取得に失敗しました
  </p>
  <p v-else class="text-sm text-neutral-400">
    あなたは今、<span class="text-green-400 font-bold">{{ count }}</span
    >個目のポットです。
  </p>
</template>
