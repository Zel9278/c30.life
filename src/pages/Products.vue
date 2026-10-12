<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { productIcon } from "../data/productIcons.ts"
import {
  formatUptime,
  loadProductStatuses,
  type ProductStatuses,
  productCategories,
  productHost,
  productHue,
  productMonogram,
  productStateLabels,
  productsPage,
  statusOf,
  statusPageUrl,
} from "../data/products.ts"

// 稼働状況は status.c30.life の API から。取れなければカードは状態なしで出す
const statuses = ref<ProductStatuses | null>(null)
const failed = ref(false)

onMounted(async () => {
  try {
    statuses.value = await loadProductStatuses()
  } catch (error) {
    console.error(error)
    failed.value = true
  }
})

const allProducts = computed(() => productCategories.flatMap((c) => c.products))
const counts = computed(() => {
  const list = allProducts.value.map((p) => statusOf(statuses.value, p)?.state)
  return {
    total: allProducts.value.length,
    up: list.filter((s) => s === "up").length,
    down: list.filter((s) => s === "down").length,
    maintenance: list.filter((s) => s === "maintenance").length,
  }
})
const checkedAt = computed(() =>
  statuses.value?.checkedAt
    ? new Date(statuses.value.checkedAt).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null,
)

const stateClasses = {
  up: "text-green-400 bg-green-500/10 border-green-500/30",
  down: "text-red-400 bg-red-500/10 border-red-500/30",
  maintenance: "text-sky-400 bg-sky-500/10 border-sky-500/30",
} as const
const stateDots = {
  up: "bg-green-400",
  down: "bg-red-400",
  maintenance: "bg-sky-400",
} as const

const categoryId = (name: string) => `category-${name.toLowerCase()}`
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        {{ productsPage.title }}
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        {{ productsPage.subtitle }}（稼働状況は
        <a
          :href="productsPage.statusUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sky-400 hover:text-sky-300 transition-colors"
          >{{ productHost(productsPage.statusUrl) }}</a
        >）
      </p>

      <!-- まとめ: サービスの数と、今の稼働状況 -->
      <div class="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <span class="px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-200">
          {{ counts.total }} サービス
        </span>
        <template v-if="statuses">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border" :class="stateClasses.up">
            <span class="w-2 h-2 rounded-full" :class="stateDots.up" />{{ counts.up }} 稼働中
          </span>
          <span
            v-if="counts.maintenance"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border"
            :class="stateClasses.maintenance"
          >
            <span class="w-2 h-2 rounded-full" :class="stateDots.maintenance" />{{ counts.maintenance }} メンテナンス中
          </span>
          <span
            v-if="counts.down"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border"
            :class="stateClasses.down"
          >
            <span class="w-2 h-2 rounded-full" :class="stateDots.down" />{{ counts.down }} 停止中
          </span>
          <span v-if="checkedAt" class="text-neutral-500 text-xs">{{ checkedAt }} 時点</span>
        </template>
        <span v-else-if="failed" class="text-neutral-500 text-xs">稼働状況を取得できませんでした</span>
        <span v-else class="text-neutral-500 text-xs animate-pulse">稼働状況を確認中…</span>

        <!-- カテゴリへ -->
        <nav class="flex flex-wrap gap-2 sm:ml-auto" aria-label="カテゴリ">
          <a
            v-for="category in productCategories"
            :key="category.name"
            :href="`#${categoryId(category.name)}`"
            class="px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/60 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
          >
            {{ category.name }}
            <span class="text-neutral-500">{{ category.products.length }}</span>
          </a>
        </nav>
      </div>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-6" />

      <div
        v-for="category in productCategories"
        :id="categoryId(category.name)"
        :key="category.name"
        class="mb-10 last:mb-0 scroll-mt-20"
      >
        <h2 class="flex items-baseline gap-2 text-lg md:text-xl font-semibold text-neutral-200 mb-4">
          {{ category.name }}
          <span class="text-sm font-normal text-neutral-500">{{ category.products.length }}</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <article
            v-for="product in category.products"
            :key="product.url"
            class="group relative flex flex-col gap-2 px-4 py-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-500 hover:bg-neutral-800 transition-all duration-300"
          >
            <div class="flex items-start gap-3">
              <!-- サービスの favicon（scripts/product-icons.mjs）。無ければホスト名から作る頭文字 -->
              <span
                v-if="productIcon(product.url)"
                class="shrink-0 grid place-items-center w-10 h-10 rounded-lg overflow-hidden"
                :class="productIcon(product.url)!.light ? 'bg-neutral-200 p-1' : ''"
                aria-hidden="true"
              >
                <img
                  :src="productIcon(product.url)!.src"
                  alt=""
                  width="40"
                  height="40"
                  loading="lazy"
                  class="w-full h-full object-contain"
                />
              </span>
              <span
                v-else
                class="shrink-0 grid place-items-center w-10 h-10 rounded-lg text-sm font-bold tracking-tight"
                :style="{
                  background: `hsl(${productHue(product.url)} 55% 22%)`,
                  color: `hsl(${productHue(product.url)} 85% 78%)`,
                }"
                aria-hidden="true"
                >{{ productMonogram(product.url) }}</span
              >
              <div class="min-w-0 flex-1">
                <!-- カード全体がこのリンク（after で広げる） -->
                <a
                  :href="product.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block text-neutral-100 group-hover:text-white transition-colors text-sm md:text-base font-medium leading-snug after:absolute after:inset-0 after:rounded-xl"
                >
                  {{ product.title }}
                </a>
                <span class="block text-neutral-500 text-xs font-mono break-all mt-0.5">
                  {{ productHost(product.url) }}
                </span>
              </div>
            </div>

            <p class="text-neutral-400 text-xs md:text-sm leading-relaxed">
              {{ product.description }}
            </p>

            <div class="mt-auto pt-2 flex flex-wrap items-center gap-1.5">
              <!-- 稼働状況（status.c30.life のそのサービスのページへ） -->
              <a
                v-if="statusOf(statuses, product)"
                :href="statusPageUrl(product.url)"
                target="_blank"
                rel="noopener noreferrer"
                class="relative z-10 ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] hover:brightness-125 transition"
                :class="stateClasses[statusOf(statuses, product)!.state]"
                :title="`30日の稼働率 ${formatUptime(statusOf(statuses, product)!.uptime30d)}`"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="stateDots[statusOf(statuses, product)!.state]" />
                {{ productStateLabels[statusOf(statuses, product)!.state] }}
                <span class="text-neutral-400">
                  · {{ formatUptime(statusOf(statuses, product)!.uptime30d) }}
                  <template v-if="statusOf(statuses, product)!.latency !== null">
                    · {{ statusOf(statuses, product)!.latency }}ms</template
                  >
                </span>
              </a>
              <span
                v-else-if="!statuses && !failed"
                class="ml-auto w-24 h-5 rounded-full bg-neutral-700/40 animate-pulse"
                aria-hidden="true"
              />
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
